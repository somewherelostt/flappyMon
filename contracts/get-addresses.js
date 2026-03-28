const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./broadcast/DeployMonadAd.s.sol/10143/run-latest.json'));
console.log('--- DEPLOYMENT ADDRESSES ---');
data.transactions.forEach(t => {
    if (t.transactionType === 'CREATE') {
        console.log(`${t.contractName}: ${t.contractAddress}`);
    }
});
