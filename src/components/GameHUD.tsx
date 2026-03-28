"use client";

import { useAccount } from 'wagmi';

interface GameHUDProps {
  score: number;
}

export default function GameHUD({ score }: GameHUDProps) {
  const { address, isConnected } = useAccount();

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <div className="flex justify-between items-start p-4">
        {/* MON Balance - Top Left */}
        <div className="pixel-font text-xs text-cyan-400 neon-glow">
          <div className="bg-black/50 px-3 py-2 rounded border border-cyan-500/30">
            MON: 0.00
          </div>
        </div>

        {/* Score - Top Center */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="pixel-font text-4xl text-white neon-glow">
            {score}
          </div>
        </div>

        {/* Wallet Address - Top Right */}
        {isConnected && address && (
          <div className="pixel-font text-xs text-purple-400 neon-glow">
            <div className="bg-black/50 px-3 py-2 rounded border border-purple-500/30">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
        <div className="pixel-font text-xs text-white/60 animate-pulse">
          TAP OR PRESS SPACE TO JUMP
        </div>
      </div>
    </div>
  );
}
