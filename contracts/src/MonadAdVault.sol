// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MonadAdVault
 * @dev Secure treasury for holding publisher ad revenues.
 * Separated to reduce state contention in the marketplace.
 */
contract MonadAdVault is AccessControl, ReentrancyGuard {
    bytes32 public constant MARKET_ROLE = keccak256("MARKET_ROLE");

    IERC20 public immutable paymentToken;

    // Flat mappings to maximize Monad parallel execution logic
    mapping(address => uint256) public publisherRevenues;

    event RevenueDeposited(address indexed publisher, uint256 amount);
    event RevenueClaimed(address indexed publisher, uint256 amount);

    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Called by the MonadAdMarket when a bid is settled.
     */
    function depositRevenue(address publisher, uint256 amount) external onlyRole(MARKET_ROLE) {
        require(publisher != address(0), "Invalid publisher");
        publisherRevenues[publisher] += amount;
        emit RevenueDeposited(publisher, amount);
    }

    /**
     * @dev Publishers pull their accumulated revenue (Pull over Push paradigm).
     */
    function claimRevenue() external nonReentrant {
        uint256 claimable = publisherRevenues[msg.sender];
        require(claimable > 0, "No revenue to claim");

        publisherRevenues[msg.sender] = 0; // CEI pattern
        
        require(paymentToken.transfer(msg.sender, claimable), "Transfer failed");
        emit RevenueClaimed(msg.sender, claimable);
    }
}
