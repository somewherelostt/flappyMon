// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MonadAdRegistry.sol";
import "../src/MonadAdVault.sol";
import "../src/MonadAdMarket.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MonadAdMarketTest is Test {
    MonadAdRegistry registry;
    MonadAdVault vault;
    MonadAdMarket market;
    MockUSDC usdc;

    address publisher = address(0x1111);
    address advertiser1 = address(0x2222);
    address advertiser2 = address(0x3333);

    bytes32 slotId = keccak256("demo-header");

    function setUp() public {
        usdc = new MockUSDC();
        registry = new MonadAdRegistry();
        vault = new MonadAdVault(address(usdc));
        market = new MonadAdMarket(address(registry), address(vault), address(usdc), publisher);

        // Setup Roles
        registry.grantRole(registry.MARKET_ROLE(), address(market));
        vault.grantRole(vault.MARKET_ROLE(), address(market));

        // Create initial slot
        registry.registerSlot(slotId, 1e6); // 1 USDC Base Price

        // Fund advertisers
        usdc.mint(advertiser1, 100e6);
        usdc.mint(advertiser2, 100e6);

        // Approve Market
        vm.prank(advertiser1);
        usdc.approve(address(market), type(uint256).max);

        vm.prank(advertiser2);
        usdc.approve(address(market), type(uint256).max);
    }

    function test_InitialSlotPurchase() public {
        vm.prank(advertiser1);
        market.purchaseSlot(slotId, "ipfs://QmAd1", 3600, 1e6);

        // Assert registry updated
        (address currentOwner, uint256 currentPrice, uint256 expiry) = registry.activeSlots(slotId);
        assertEq(currentOwner, advertiser1);
        assertEq(currentPrice, 1e6);
        assertEq(expiry, block.timestamp + 3600);

        // Assert vault received payment
        assertEq(usdc.balanceOf(address(vault)), 1e6);
        assertEq(vault.publisherRevenues(publisher), 1e6);
    }

    function test_QueueBid() public {
        // First advertiser buys the slot
        vm.prank(advertiser1);
        market.purchaseSlot(slotId, "ipfs://QmAd1", 3600, 1e6);

        // Second advertiser queues the next slot by outbidding the base price significantly
        vm.prank(advertiser2);
        market.purchaseSlot(slotId, "ipfs://QmAd2", 3600, 2e6);

        // Assert queue is set
        (address queuedOwner, uint256 queuedPrice, ) = registry.queuedBids(slotId);
        assertEq(queuedOwner, advertiser2);
        assertEq(queuedPrice, 2e6);

        // Assert payment is held in market escrow
        assertEq(usdc.balanceOf(address(market)), 2e6);
    }

    function test_OutbidAndPullRefund() public {
        // First active buy
        vm.prank(advertiser1);
        market.purchaseSlot(slotId, "ipfs://QmAd1", 3600, 1e6);

        // Admin queues
        usdc.mint(address(this), 10e6);
        usdc.approve(address(market), 10e6);
        market.purchaseSlot(slotId, "ipfs://QmSelf", 3600, 2e6);

        // Advertiser 2 outbids the queued bidder (Admin)
        vm.prank(advertiser2);
        market.purchaseSlot(slotId, "ipfs://QmAd2", 3600, 3e6);

        // Check if previous queue holder got refund pending
        uint256 refund = market.pendingRefunds(address(this));
        assertEq(refund, 2e6);

        // Claim refund
        uint256 balanceBefore = usdc.balanceOf(address(this));
        market.claimRefund();
        uint256 balanceAfter = usdc.balanceOf(address(this));
        assertEq(balanceAfter - balanceBefore, 2e6);
        assertEq(market.pendingRefunds(address(this)), 0);
    }

    function test_RotateSlot() public {
        vm.prank(advertiser1);
        market.purchaseSlot(slotId, "ipfs://QmAd1", 3600, 1e6);

        vm.prank(advertiser2);
        market.purchaseSlot(slotId, "ipfs://QmAd2", 3600, 2e6);

        // Move time past expiration
        vm.warp(block.timestamp + 3601);

        // Anyone can call rotateAd
        market.rotateAd(slotId, "ipfs://QmAd2", 3600);

        (address activeOwner, uint256 price, uint256 expiry) = registry.activeSlots(slotId);
        assertEq(activeOwner, advertiser2);
        assertEq(price, 2e6);
        assertEq(expiry, block.timestamp + 3600);

        // Vault should have base 1e6 + new 2e6 = 3e6
        assertEq(vault.publisherRevenues(publisher), 3e6);

        // Queued bid should be empty
        (address queuedOwner, , ) = registry.queuedBids(slotId);
        assertEq(queuedOwner, address(0));
    }
}
