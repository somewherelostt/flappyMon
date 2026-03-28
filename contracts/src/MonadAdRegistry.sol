// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MonadAdRegistry
 * @dev Core storage module for Ad Spaces, heavily optimized for MonadDB async IO.
 * Flat storage, no looping logic.
 */
contract MonadAdRegistry is AccessControl {
    bytes32 public constant MARKET_ROLE = keccak256("MARKET_ROLE");

    struct AdSlot {
        address currentOwner;
        uint256 currentPrice;
        uint256 expirationTime;
        // ipfsHash string is deliberately omitted to save state bloat. 
        // Emitted in events instead (calldata -> Event logging)
    }

    // Flat mappings by hashed slot ID
    mapping(bytes32 => AdSlot) public activeSlots;
    mapping(bytes32 => AdSlot) public queuedBids; // Single upcoming queue per slot

    event SlotRegistered(bytes32 indexed slotId, uint256 startingPrice);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function registerSlot(bytes32 slotId, uint256 startingPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(activeSlots[slotId].currentPrice == 0, "Slot already exists");
        activeSlots[slotId] = AdSlot({
            currentOwner: address(0),
            currentPrice: startingPrice,
            expirationTime: 0
        });
        emit SlotRegistered(slotId, startingPrice);
    }

    function updateActiveSlot(bytes32 slotId, address newOwner, uint256 price, uint256 expiration) external onlyRole(MARKET_ROLE) {
        activeSlots[slotId] = AdSlot({
            currentOwner: newOwner,
            currentPrice: price,
            expirationTime: expiration
        });
    }

    function updateQueuedBid(bytes32 slotId, address newOwner, uint256 price) external onlyRole(MARKET_ROLE) {
        queuedBids[slotId] = AdSlot({
            currentOwner: newOwner,
            currentPrice: price,
            expirationTime: 0
        });
    }

    function clearQueuedBid(bytes32 slotId) external onlyRole(MARKET_ROLE) {
        delete queuedBids[slotId];
    }
}
