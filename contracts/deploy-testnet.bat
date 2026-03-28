@echo off
echo Starting Deployment to Monad Testnet...

:: Load .env variables (Simulation of source .env)
if not exist .env (
    echo [ERROR] .env file not found. Copy .env.example to .env and populate PRIVATE_KEY
    exit /b 1
)

echo Executing Forge Deploy Broadcast...
forge script script/DeployMonadAd.s.sol:DeployMonadAd --rpc-url monad_testnet --broadcast --verify --verifier blockscout --verifier-url https://explorer.monad-testnet.xyz/api\? --legacy
if %errorlevel% neq 0 (
    echo [ERROR] Foundry deployment failed.
    exit /b %errorlevel%
)

echo [SUCCESS] Contracts Deployed!
echo Exporting ABIs to Next.js Frontend...
node export-abis.js

echo Deployment Pipeline Complete.
