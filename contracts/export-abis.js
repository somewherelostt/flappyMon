const fs = require('fs');
const path = require('path');

const FOUNDRY_OUT = path.join(__dirname, 'out');
const NEXT_ABIS_DIR = path.join(__dirname, '../app/lib/abis');

// Contracts we care about
const contracts = [
  { file: 'MonadAdRegistry.sol', name: 'MonadAdRegistry' },
  { file: 'MonadAdMarket.sol', name: 'MonadAdMarket' },
  { file: 'MonadAdVault.sol', name: 'MonadAdVault' },
  { file: 'MockUSDC.sol', name: 'MockUSDC' }
];

console.log('Starting ABI Export from Foundry...');

if (!fs.existsSync(NEXT_ABIS_DIR)) {
  fs.mkdirSync(NEXT_ABIS_DIR, { recursive: true });
}

contracts.forEach(({ file, name }) => {
  const artifactPath = path.join(FOUNDRY_OUT, file, `${name}.json`);
  const exportPath = path.join(NEXT_ABIS_DIR, `${name}.json`);

  if (!fs.existsSync(artifactPath)) {
    console.warn(`[SKIP] Artifact not found for ${name}. Did you run 'forge build'?`);
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // We only need the ABI for the frontend
    const ABI = data.abi;

    fs.writeFileSync(exportPath, JSON.stringify(ABI, null, 2));
    console.log(`[OK] Exported ABI for ${name} -> ${exportPath}`);
  } catch (e) {
    console.error(`[ERROR] Failed to export ${name}:`, e.message);
  }
});

console.log('ABI Export Complete.');
