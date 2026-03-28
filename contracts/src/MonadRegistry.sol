// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonadRegistry is Ownable {
    IERC20 public paymentToken;
    
    struct AdSlot {
        address currentOwner;
        uint256 currentPrice;
        string ipfsHash;
        uint256 expirationTime;
    }
    
    // Flat mapping (Slot ID => AdSlot) to utilize MonadDB async IO efficiently:
    mapping(string => AdSlot) public adSlots;
    // Flat mapping for next queued bid
    mapping(string => AdSlot) public queuedBids;
    
    // Events
    event AdPurchased(string slotId, address newOwner, uint256 price, string ipfsHash, uint256 expirationTime);
    event BidPlaced(string slotId, address bidder, uint256 amount, string ipfsHash);
    
    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
    }
    
    // Immediate purchase or outbid current active ad if expired
    function purchaseSlot(string calldata slotId, string calldata ipfsHash, uint256 durationSecs, uint256 bidAmount) external {
        AdSlot storage currentAd = adSlots[slotId];
        
        // If the current ad is active, we just queue the bid
        if (block.timestamp < currentAd.expirationTime) {
            _queueBid(slotId, ipfsHash, bidAmount);
            return;
        }
        
        // Slot is available or expired
        require(bidAmount >= currentAd.currentPrice, "Bid too low");
        
        // Transfer tokens from buyer to contract
        require(paymentToken.transferFrom(msg.sender, address(this), bidAmount), "Payment failed");
        
        currentAd.currentOwner = msg.sender;
        currentAd.currentPrice = bidAmount;
        currentAd.ipfsHash = ipfsHash;
        currentAd.expirationTime = block.timestamp + durationSecs;
        
        emit AdPurchased(slotId, msg.sender, bidAmount, ipfsHash, currentAd.expirationTime);
    }
    
    function _queueBid(string calldata slotId, string calldata ipfsHash, uint256 bidAmount) internal {
        AdSlot storage queued = queuedBids[slotId];
        require(bidAmount > queued.currentPrice, "Bid not high enough to beat current queue");
        
        // Refund previous bidder if there was one
        if (queued.currentOwner != address(0)) {
            require(paymentToken.transfer(queued.currentOwner, queued.currentPrice), "Refund failed");
        }
        
        // Take payment for the new bid
        require(paymentToken.transferFrom(msg.sender, address(this), bidAmount), "Payment failed");
        
        queued.currentOwner = msg.sender;
        queued.currentPrice = bidAmount;
        queued.ipfsHash = ipfsHash;
        
        emit BidPlaced(slotId, msg.sender, bidAmount, ipfsHash);
    }
    
    // Rotate the queue into the active slot once current ad expires
    function rotateAd(string calldata slotId, uint256 durationSecs) external {
        AdSlot storage currentAd = adSlots[slotId];
        require(block.timestamp >= currentAd.expirationTime, "Current ad still active");
        
        AdSlot memory queued = queuedBids[slotId];
        require(queued.currentOwner != address(0), "No queued bid");
        
        currentAd.currentOwner = queued.currentOwner;
        currentAd.currentPrice = queued.currentPrice;
        currentAd.ipfsHash = queued.ipfsHash;
        currentAd.expirationTime = block.timestamp + durationSecs;
        
        // Clear the queue
        delete queuedBids[slotId];
        
        emit AdPurchased(slotId, currentAd.currentOwner, currentAd.currentPrice, currentAd.ipfsHash, currentAd.expirationTime);
    }
    
    // Admin function to withdraw generated ad revenue
    function withdrawFunds() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(paymentToken.transfer(owner(), balance), "Withdraw failed");
    }
}
