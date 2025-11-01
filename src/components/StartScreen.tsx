"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";

interface StartScreenProps {
  onPlay: (txHash?: string) => void;
  onLeaderboard: () => void;
}

const ENTRY_FEE = "0.001"; // 0.001 MON
const TREASURY_ADDRESS = "0xa27e56f7e85cc6dea4d913ed311919727b3eb7e8"; // Your treasury wallet

export default function StartScreen({
  onPlay,
  onLeaderboard,
}: StartScreenProps) {
  const { address, isConnected } = useAccount();
  const {
    sendTransaction,
    isPending,
    isSuccess,
    data: txHash,
  } = useSendTransaction();
  const [isProcessing, setIsProcessing] = useState(false);
  const [alienY, setAlienY] = useState(0);

  useEffect(() => {
    let direction = 1;
    const interval = setInterval(() => {
      setAlienY((prev) => {
        const next = prev + direction * 2;
        if (next > 20 || next < -20) direction *= -1;
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Handle successful payment
  useEffect(() => {
    if (isSuccess && txHash) {
      setIsProcessing(false);
      // Start the game immediately after successful payment, passing the txHash
      setTimeout(() => {
        onPlay(txHash);
      }, 1000);
    }
  }, [isSuccess, txHash, onPlay]);

  const handlePlay = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      setIsProcessing(true);

      // Send entry fee transaction
      sendTransaction({
        to: TREASURY_ADDRESS,
        value: parseEther(ENTRY_FEE),
      });
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden game-container">
      {/* Animated background stars */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Animated alien */}
        <div
          className="text-8xl transition-transform duration-100"
          style={{ transform: `translateY(${alienY}px)` }}
        >
          👾
        </div>

        {/* Title */}
        <div className="text-center space-y-4">
          <h1 className="pixel-font text-3xl md:text-4xl text-white neon-glow text-purple-400 leading-relaxed">
            FLAPPY ALIEN
          </h1>
          <div className="pixel-font text-sm md:text-base text-cyan-400 neon-glow">
            Powered by Monad
          </div>
          <p className="pixel-font text-xs md:text-sm text-white/80 mt-2">
            Earn MON tokens as you fly
          </p>
          <a
            href={`https://testnet.monadexplorer.com/address/${TREASURY_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-font text-xs text-cyan-400/60 hover:text-cyan-400 underline mt-2"
            title="View all payments on explorer"
          >
            🔍 Verify Payments
          </a>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
          <button
            onClick={handlePlay}
            disabled={!isConnected || isProcessing || isPending}
            className="pixel-button pixel-font text-sm text-white uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing || isPending
              ? "Processing Payment..."
              : `Play (${ENTRY_FEE} MON)`}
          </button>

          {/* Show transaction hash and explorer link when pending */}
          {isPending && txHash && (
            <div className="p-3 bg-cyan-900/30 border-2 border-cyan-500 rounded">
              <div className="pixel-font text-xs text-cyan-400 mb-2">
                ⏳ Payment Processing...
              </div>
              <a
                href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/80 hover:text-cyan-400 underline break-all block"
              >
                View on Explorer →
              </a>
            </div>
          )}

          {!isConnected && (
            <div className="text-center pixel-font text-xs text-yellow-400">
              Connect wallet to play
            </div>
          )}

          <button
            onClick={onLeaderboard}
            className="pixel-button pixel-font text-sm text-white uppercase tracking-wider"
            style={{ background: "var(--color-pixel-indigo)" }}
          >
            Leaderboard
          </button>

          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>

        {/* Monad logo text */}
        <div className="absolute bottom-8 right-8 pixel-font text-xs text-purple-400/50">
          MONAD
        </div>
      </div>
    </div>
  );
}
