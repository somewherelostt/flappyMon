# 🎮 Flappy Alien - Monad Arcade

**Live Demo**: [https://flappymon-lake.vercel.app/](https://flappymon-lake.vercel.app/)

A blockchain-powered arcade game built on Monad Testnet. Classic Flappy Bird mechanics meet Web3 economics—pay to play, compete globally, and earn rewards.

---

## 🎯 Overview

Flappy Alien combines nostalgic arcade gameplay with instant blockchain payments. Powered by Monad's high-throughput network, every game is a verifiable on-chain transaction with sub-second confirmation times.

### Key Features

- **Instant Payments**: 0.001 MON entry fee with ~1 second confirmation
- **Global Leaderboard**: Real-time rankings with top 100 players
- **Reward System**: Earn 0.000000001 MON per game (mock implementation)
- **Verifiable Transactions**: All payments tracked on [Monad Explorer](https://testnet.monadexplorer.com/address/0xa27e56f7e85cc6dea4d913ed311919727b3eb7e8?type=Transactions&tab=Transaction)
- **Web3 Native**: Wallet-based identity, no registration required

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MetaMask or compatible Web3 wallet
- Monad Testnet MON ([Get from faucet](https://testnet.monad.xyz))

### Installation

```bash
# Clone repository
git clone https://github.com/somewherelostt/flappyMon

# Install dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env.local
# Add your MongoDB URI (optional for development)

# Run development server
npm run dev
```

Visit `http://localhost:3000`

---

## 🎮 How to Play

1. **Connect Wallet** → Click "Connect Wallet" and select your provider
2. **Add Monad Testnet** → Network auto-configures (Chain ID: 10143)
3. **Get Test MON** → Visit [Monad Faucet](https://testnet.monad.xyz)
4. **Pay Entry Fee** → Click "Play (0.001 MON)" and approve transaction
5. **Play Game** → Use SPACEBAR or tap/click to control the alien
6. **Submit Score** → Save your score to compete on the leaderboard

**Controls**: SPACEBAR / Click / Tap to jump

---

## 🌐 Network Configuration

| Parameter | Value |
|-----------|-------|
| **Network** | Monad Testnet |
| **Chain ID** | 10143 (0x279F) |
| **RPC URL** | https://testnet-rpc.monad.xyz |
| **Currency** | MON |
| **Block Time** | ~1 second |
| **Explorer** | https://testnet.monadexplorer.com/ |
| **Faucet** | https://testnet.monad.xyz |

### Treasury Address

All entry fees are sent to: `0xa27e56f7e85cc6dea4d913ed311919727b3eb7e8`

[View Transactions](https://testnet.monadexplorer.com/address/0xa27e56f7e85cc6dea4d913ed311919727b3eb7e8?type=Transactions&tab=Transaction)

---

## 💻 Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

**Game Engine**
- Phaser 3.90.0 (Arcade Physics)

**Web3 Integration**
- Wagmi v2
- Viem
- RainbowKit

**Database**
- MongoDB (with in-memory fallback)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main game interface
│   ├── leaderboard/page.tsx        # Leaderboard rankings
│   └── api/leaderboard/route.ts    # Score submission API
├── components/
│   ├── PhaserGame.tsx              # Phaser game scene
│   ├── StartScreen.tsx             # Entry + payment flow
│   ├── GameOverOverlay.tsx         # Score submission UI
│   └── Web3Provider.tsx            # Wallet configuration
└── lib/
    ├── wagmi.ts                    # Monad network config
    └── mongodb.ts                  # Database connection
```

---

## 🔧 Environment Variables

```env
# .env.local
MONGODB_URI=mongodb://localhost:27017/flappyalien
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production deployment, add:
```env
MONGODB_URI=mongodb+srv://...       # MongoDB Atlas connection
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

### Environment Setup

Production requires:
- `MONGODB_URI` - MongoDB Atlas connection string

---

## 📊 Game Economics

### Entry Fee
- **Amount**: 0.001 MON (fixed)
- **Payment**: Required before each game
- **Confirmation**: ~1 second via Monad

### Rewards (Current Implementation)
- **Amount**: 0.000000001 MON per game
- **Status**: Mock implementation (frontend only)
- **Future**: Smart contract-based distribution

### Leaderboard
- Stores only high scores per wallet
- Auto-refreshes every 10 seconds
- Top 100 rankings displayed
- MongoDB-backed persistence

---

## 🔐 Transaction Verification

All game payments are publicly verifiable:

**Treasury Address**: `0xa27e56f7e85cc6dea4d913ed311919727b3eb7e8`

**View Transactions**: [Monad Explorer](https://testnet.monadexplorer.com/address/0xa27e56f7e85cc6dea4d913ed311919727b3eb7e8?type=Transactions&tab=Transaction)

Each transaction includes:
- Sender wallet address
- 0.001 MON entry fee
- Gas fees (minimal on Monad)
- Timestamp & block confirmation

---

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start dev server (port 3000)

# Production
npm run build            # Build optimized production bundle
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint checks
```

---

## 📈 Roadmap

**Phase 1** (Current)
- [x] Core game mechanics
- [x] Payment integration
- [x] Leaderboard system
- [x] Testnet deployment

**Phase 2** (In Progress)
- [ ] Smart contract rewards
- [ ] Score validation system
- [ ] Mobile optimization

**Phase 3** (Planned)
- [ ] Achievement system
- [ ] NFT character skins
- [ ] Tournament mode
- [ ] Mainnet launch

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Demo**: [https://flappymon-lake.vercel.app/](https://flappymon-lake.vercel.app/)
- **GitHub**: [https://github.com/somewherelostt/flappyMon](https://github.com/somewherelostt/flappyMon)
- **Treasury Transactions**: [View on Explorer](https://testnet.monadexplorer.com/address/0xa27e56f7e85cc6dea4d913ed311919727b3eb7e8?type=Transactions&tab=Transaction)
- **Monad**: [https://monad.xyz](https://monad.xyz)
- **Monad Discord**: [https://discord.gg/monad](https://discord.gg/monad)

---

## 🙏 Acknowledgments

Built with ❤️ on Monad Testnet

- [Monad](https://monad.xyz) - High-performance blockchain infrastructure
- [Phaser](https://phaser.io) - HTML5 game engine
- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection UI
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum

---

**Pay to play. Play to earn. Have fun!** 🎮👾🚀