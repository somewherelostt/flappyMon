// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MonadAdVault.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MonadAdVaultTest is Test {
    MonadAdVault vault;
    MockUSDC usdc;

    address publisher = address(0xAAAA);
    address mockMarket = address(0xBBBB);

    function setUp() public {
        usdc = new MockUSDC();
        vault = new MonadAdVault(address(usdc));

        // Grant MARKET_ROLE to our mock market address
        vault.grantRole(vault.MARKET_ROLE(), mockMarket);

        usdc.mint(mockMarket, 1000e6);
        
        // Simulating the market sending funds to the vault
        vm.prank(mockMarket);
        usdc.transfer(address(vault), 1000e6);
    }

    function test_DepositRevenueOnlyMarket() public {
        vm.prank(publisher);
        vm.expectRevert(); // Missing role
        vault.depositRevenue(publisher, 100e6);

        vm.prank(mockMarket);
        vault.depositRevenue(publisher, 100e6);
        assertEq(vault.publisherRevenues(publisher), 100e6);
    }

    function test_PublisherCanClaim() public {
        vm.prank(mockMarket);
        vault.depositRevenue(publisher, 500e6);

        assertEq(usdc.balanceOf(publisher), 0);

        vm.prank(publisher);
        vault.claimRevenue();

        assertEq(usdc.balanceOf(publisher), 500e6);
        assertEq(vault.publisherRevenues(publisher), 0);
    }

    function test_ClaimFailsIfNoRevenue() public {
        vm.prank(publisher);
        vm.expectRevert("No revenue to claim");
        vault.claimRevenue();
    }
}
