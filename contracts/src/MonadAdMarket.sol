// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./MonadAdRegistry.sol";
import "./MonadAdVault.sol";

/**
 * @title MonadAdMarket
 * @dev Orchestrator for x402 purchasing, bidding, and state-transitions.
 * Uses pull-refunds and parallel-friendly storage logic.
 */
contract MonadAdMarket is ReentrancyGuard {
    using SafeERC20 for IERC20;

    MonadAdRegistry public immutable registry;
    MonadAdVault public immutable vault;
    IERC20 public immutable paymentToken;

    // Pull-refund mapping for outbid users
    mapping(address => uint256) public pendingRefunds;

    // Hardcoded global publisher receiver for simplicity (owner of vault essentially)
    address public immutable platformPublisher;

    event AdPurchased(bytes32 indexed slotId, address indexed buyer, uint256 price, string ipfsHash, uint256 expiry);
    event BidPlaced(bytes32 indexed slotId, address indexed bidder, uint256 amount, string ipfsHash);
    event RefundQueued(address indexed user, uint256 amount);
    event RefundClaimed(address indexed user, uint256 amount);

    constructor(address _registry, address _vault, address _paymentToken, address _publisher) {
        registry = MonadAdRegistry(_registry);
        vault = MonadAdVault(_vault);
        paymentToken = IERC20(_paymentToken);
        platformPublisher = _publisher;
    }

    /**
     * @dev Process an x402 payment to purchase an expired/empty slot or join the queue.
     * Receives IPFS Hash as calldata out of state storage for significant gas savings.
     */
    function purchaseSlot(
        bytes32 slotId, 
        string calldata ipfsHash, 
        uint256 durationSecs, 
        uint256 bidAmount
    ) external nonReentrant {
        
        (address currentOwner, uint256 activePrice, uint256 activeExpiry) = registry.activeSlots(slotId);
        require(activePrice > 0, "Slot does not exist");
        
        // Scenario 1: Slot is expired or explicitly empty
        if (block.timestamp >= activeExpiry) {
            
            // If there's a queued bid, we must outbid that queued bid to take the slot immediately!
            (address queuedOwner, uint256 queuedPrice, ) = registry.queuedBids(slotId);
            
            if (queuedOwner != address(0)) {
                require(bidAmount > queuedPrice, "Active bid too low against queue");
                
                // Refund the old queued bid securely via pull-mechanism
                pendingRefunds[queuedOwner] += queuedPrice;
                emit RefundQueued(queuedOwner, queuedPrice);
                
                // We clear the queue since we overtook them natively
                registry.clearQueuedBid(slotId);
            } else {
                // No queue, just beat the base price
                require(bidAmount >= activePrice, "Bid too low");
            }

            // Route tokens through x402 exact requirement: Escrow to vault
            paymentToken.safeTransferFrom(msg.sender, address(vault), bidAmount);
            vault.depositRevenue(platformPublisher, bidAmount);
            
            uint256 newExpiry = block.timestamp + durationSecs;
            registry.updateActiveSlot(slotId, msg.sender, bidAmount, newExpiry);
            
            emit AdPurchased(slotId, msg.sender, bidAmount, ipfsHash, newExpiry);
            return;
        }
        
        // Scenario 2: Slot is currently active, we are bidding into the NEXT queue
        _queueBid(slotId, ipfsHash, bidAmount);
    }

    function _queueBid(bytes32 slotId, string calldata ipfsHash, uint256 bidAmount) internal {
        (address queuedOwner, uint256 queuedPrice, ) = registry.queuedBids(slotId);
        
        require(bidAmount > queuedPrice, "Bid not high enough to beat current queue");

        // Refund previous queue holder via pull-refund mapping to avoid locked state externally
        if (queuedOwner != address(0)) {
            pendingRefunds[queuedOwner] += queuedPrice;
            emit RefundQueued(queuedOwner, queuedPrice);
        }

        // Transfer funds from bidder to this market contract to hold in escrow
        paymentToken.safeTransferFrom(msg.sender, address(this), bidAmount);
        
        // Update registry queue
        registry.updateQueuedBid(slotId, msg.sender, bidAmount);

        // Emit IPFS hash off-chain via Events
        emit BidPlaced(slotId, msg.sender, bidAmount, ipfsHash);
    }

    /**
     * @dev Rotates the single slot queue into active position once current duration expires
     * Notice: The `ipfsHash` is missing because we didn't store it in MonadDB to save gas.
     * The rotating service or facilitator passing the rotate instruction will re-supply it from subgraph!
     */
     function rotateAd(bytes32 slotId, string calldata queuedIpfsHash, uint256 durationSecs) external {
        (address activeOwner, , uint256 activeExpiry) = registry.activeSlots(slotId);
        require(block.timestamp >= activeExpiry, "Current ad still active");

        (address queuedOwner, uint256 queuedPrice, ) = registry.queuedBids(slotId);
        require(queuedOwner != address(0), "No queued bid to rotate");

        // Move funds from Market Escrow into Vault
        paymentToken.safeTransfer(address(vault), queuedPrice);
        vault.depositRevenue(platformPublisher, queuedPrice);

        uint256 newExpiry = block.timestamp + durationSecs;
        
        // Re-write active slot
        registry.updateActiveSlot(slotId, queuedOwner, queuedPrice, newExpiry);
        
        // Purge queue
        registry.clearQueuedBid(slotId);

        emit AdPurchased(slotId, queuedOwner, queuedPrice, queuedIpfsHash, newExpiry);
    }

    /**
     * @dev Claim outbid refunds (Pull over Push paradigm)
     */
    function claimRefund() external nonReentrant {
        uint256 amount = pendingRefunds[msg.sender];
        require(amount > 0, "No refund available");

        pendingRefunds[msg.sender] = 0; // Checks-Effects-Interactions

        paymentToken.safeTransfer(msg.sender, amount);
        emit RefundClaimed(msg.sender, amount);
    }
}
