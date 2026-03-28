import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL = process.env.MONAD_TESTNET_RPC_URL || "https://testnet-rpc.monad.xyz/";
const PRIVATE_KEY = process.env.FACILITATOR_PRIVATE_KEY || "";
const REGISTRY_ADDRESS = "0xc0b7e1ae03c8b2c8fd78247d63f87cce790187eb";

const demoSlots = [
  { slotId: "demo-header", price: "1000000" },        // 0.000001 MON
  { slotId: "demo-square", price: "500000" },        // 0.0000005 MON  
  { slotId: "demo-mobile", price: "300000" },        // 0.0000003 MON
  { slotId: "demo-hero-background", price: "100000000000000" }, // 0.00001 MON
  { slotId: "demo-hero-premium", price: "100000000000000" }, // 0.00001 MON
];

function stringToBytes32(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return "0x" + hex.padEnd(64, '0');
}

async function registerSlots() {
  if (!PRIVATE_KEY) {
    console.error("❌ Missing FACILITATOR_PRIVATE_KEY in .env");
    console.log("Add to .env: FACILITATOR_PRIVATE_KEY=your_private_key_here");
    return;
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("👛 Wallet:", wallet.address);
  console.log("📋 Registry:", REGISTRY_ADDRESS);
  console.log("");

  const registryABI = [
    "function registerSlot(bytes32 slotId, uint256 startingPrice) external",
    "function activeSlots(bytes32 slotId) view returns (address currentOwner, uint256 currentPrice, uint256 expirationTime)"
  ];

  const registry = new ethers.Contract(REGISTRY_ADDRESS, registryABI, wallet);

  for (const slot of demoSlots) {
    try {
      const slotBytes32 = stringToBytes32(slot.slotId);
      
      // Check if already registered
      const existing = await registry.activeSlots(slotBytes32);
      if (existing.currentPrice > 0n) {
        console.log(`⏭️  ${slot.slotId} already registered (price: ${existing.currentPrice})`);
        continue;
      }

      console.log(`📝 Registering ${slot.slotId} with price ${slot.price}...`);
      
      const tx = await registry.registerSlot(slotBytes32, BigInt(slot.price));
      console.log(`   Tx: ${tx.hash}`);
      
      await tx.wait();
      console.log(`✅ ${slot.slotId} registered!`);
    } catch (err: any) {
      console.error(`❌ Failed to register ${slot.slotId}:`, err.message);
    }
  }

  console.log("\n🎉 All slots registered!");
}

registerSlots();