// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MonadAdRegistry.sol";
import "../src/MonadAdVault.sol";
import "../src/MonadAdMarket.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC for testnet deployment compatibility
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        _mint(msg.sender, 10_000_000 * 10**decimals());
    }
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract DeployMonadAd is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address publisherAccount = vm.envAddress("PUBLISHER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockUSDC or use existing
        MockUSDC paymentToken = new MockUSDC();

        // Core Infrastructure
        MonadAdRegistry registry = new MonadAdRegistry();
        MonadAdVault vault = new MonadAdVault(address(paymentToken));

        // Market Facilitator
        MonadAdMarket market = new MonadAdMarket(
            address(registry),
            address(vault),
            address(paymentToken),
            publisherAccount
        );

        // Grant system market roles to the orchestration contract
        registry.grantRole(registry.MARKET_ROLE(), address(market));
        vault.grantRole(vault.MARKET_ROLE(), address(market));

        // Register default slots immediately for testing
        // Example: 'demo-header' 'demo-square' 'demo-mobile'
        registry.registerSlot(keccak256("demo-header"), 1e6); // 1 USDC base
        registry.registerSlot(keccak256("demo-square"), 0.5e6); // 0.5 USDC base
        registry.registerSlot(keccak256("demo-mobile"), 0.25e6); // 0.25 USDC base

        vm.stopBroadcast();
    }
}
