# 🎮 Flappy Alien - Monad Arcade

A play-to-earn Flappy Bird-style game on Monad Testnet. Pay to play, compete on the leaderboard, and earn MON tokens!

## 🌟 Features

- 🎮 *Classic Gameplay*: Flappy Bird mechanics with pixel art style
- 💰 *Play-to-Earn*: Pay 0.001 MON to play, earn 0.00001 MON per game
- 🏆 *Dynamic Leaderboard*: Real-time rankings with top 100 players
- 🔗 *Web3 Integration*: Wallet connection with Monad Testnet
- 🎨 *Retro Design*: Pixel art graphics with neon effects
- ⚡ *Blazing Fast*: Built on Monad for lightning-fast transactions

## 🚀 Quick Start

bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Open browser
# http://localhost:3000


## 🎯 How to Play

1. *Connect Wallet*: Click "Connect Wallet" and select your wallet
2. *Get Testnet MON*: Visit [Monad Faucet](https://testnet.monad.xyz)
3. *Pay to Play*: Click "Play (0.001 MON)" and approve transaction
4. *Control*: Press SPACE or click/tap to jump
5. *Submit Score*: Save your score to the leaderboard
6. *Earn Rewards*: Receive 0.00001 MON (mock for now)

## 🌐 Monad Testnet Details

- *Network*: Monad Testnet
- *RPC URL*: https://testnet-rpc.monad.xyz
- *Chain ID*: 10143 (0x279F)
- *Currency*: MON
- *Faucet*: https://testnet.monad.xyz
- *Explorer*: https://testnet.monadexplorer.com/

## 💎 Tech Stack

- *Frontend*: Next.js 15, React 19, TypeScript
- *Game Engine*: Phaser 3
- *Web3*: Wagmi, Viem, RainbowKit
- *Database*: MongoDB (with in-memory fallback)
- *Styling*: Tailwind CSS, Pixel UI
- *Blockchain*: Monad Testnet

## 📁 Project Structure


src/
├── app/
│   ├── page.tsx              # Main game page
│   ├── leaderboard/          # Leaderboard page
│   └── api/leaderboard/      # API routes
├── components/
│   ├── PhaserGame.tsx        # Game engine
│   ├── StartScreen.tsx       # Entry screen with payment
│   ├── GameOverOverlay.tsx   # Score submission
│   ├── GameHUD.tsx           # In-game UI
│   └── Web3Provider.tsx      # Wallet provider
└── lib/
    ├── wagmi.ts              # Monad config
    └── mongodb.ts            # Database connection


## 📚 Documentation

- *[Quick Start Guide](LOCALHOST_SETUP.md)* - Get started in 5 minutes
- *[Payment System](PAYMENT_SYSTEM.md)* - How rewards work
- *[MongoDB Setup](MONGODB_SETUP.md)* - Database configuration
- *[Fixes Summary](FIXES_SUMMARY.md)* - Recent changes

## 🎨 Game Mechanics

### Entry Fee
- *Cost*: 0.001 MON (fixed)
- *Payment*: Required before each game
- *Method*: Direct wallet transaction

### Rewards
- *Amount*: 0.00001 MON (fixed)
- *Distribution*: Per game completed
- *Status*: Mock (implementation guide available)

### Scoring
- +1 point for each obstacle passed
- High scores only (no score downgrade)
- Real-time leaderboard updates

## 🔧 Configuration

### Environment Variables

env
# .env.local
MONGODB_URI=mongodb://localhost:27017
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENTRY_FEE=0.001
NEXT_PUBLIC_REWARD_AMOUNT=0.00001


### Treasury Address

Update in src/components/StartScreen.tsx:
typescript
const TREASURY_ADDRESS = 'YOUR_TREASURY_ADDRESS';


## 🛠 Development

### Prerequisites
- Node.js 20+
- MetaMask or compatible wallet
- Testnet MON tokens

### Install Dependencies
bash
npm install --legacy-peer-deps


### Run Development Server
bash
npm run dev


### Build for Production
bash
npm run build
npm start


## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production
env
MONGODB_URI=mongodb+srv://...  # Your MongoDB Atlas URI
TREASURY_PRIVATE_KEY=0x...     # For reward distribution


## 🐛 Troubleshooting

### Wallet Not Connecting
- Install MetaMask extension
- Add Monad Testnet to wallet
- Check network configuration

### Payment Fails
- Ensure sufficient MON balance
- Check wallet is connected
- Try refreshing the page

### Game Not Starting
- Wait for transaction confirmation
- Check console for errors
- Refresh and try again

### Leaderboard Empty
- Normal on first load
- Play a game to add first score
- Scores auto-refresh every 10s

## 📈 Roadmap

- [ ] Implement real reward distribution
- [ ] Add score validation (anti-cheat)
- [ ] Create smart contract for rewards
- [ ] Add achievements & badges
- [ ] Implement claim-based rewards
- [ ] Add multiplayer mode
- [ ] Create token economics
- [ ] Deploy to mainnet

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Links

- *Live Demo*: Coming soon
- *Monad*: https://monad.xyz
- *Discord*: https://discord.gg/monad
- *Twitter*: Follow for updates

## 🙏 Acknowledgments

- Monad team for the testnet
- Phaser for the game engine
- RainbowKit for wallet UI
- The Web3 community

---

*Built with ❤ on Monad*

Pay to play. Play to earn. Have fun! 🎮👾🚀