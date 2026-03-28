const { ethers } = require('ethers');

const RPC_URL = "https://testnet-rpc.monad.xyz/";
const providers = new ethers.JsonRpcProvider(RPC_URL);

const contracts = [
  { name: 'MockUSDC', address: '0x4b017c27e6ad4b44002c25ca5f1ced94815cab75' },
  { name: 'MonadAdRegistry', address: '0xc0b7e1ae03c8b2c8fd78247d63f87cce790187eb' },
  { name: 'MonadAdVault', address: '0xff17790b38d752b4ee47a772ea63eac2daa6913a' },
  { name: 'MonadAdMarket', address: '0x7e3c9284633bb5b58b8d6f3cf7fce906a89d24fc' }
];

async function verify() {
  console.log("Verifying contracts on Monad Testnet (RPC: " + RPC_URL + ")...");
  for (const contract of contracts) {
    try {
      const code = await providers.getCode(contract.address);
      if (code && code !== '0x') {
        console.log(`✅ [SUCCESS] ${contract.name} is deployed at ${contract.address}`);
      } else {
        console.log(`❌ [FAILED] ${contract.name} NOT found at ${contract.address}`);
      }
    } catch (error) {
      console.log(`⚠️ [ERROR] Checking ${contract.name}: ${error.message}`);
    }
  }
}

verify();
