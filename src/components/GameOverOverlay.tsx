"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

interface GameOverOverlayProps {
  score: number;
  onRestart: () => void;
  onHome: () => void;
}

export default function GameOverOverlay({
  score,
  onRestart,
  onHome,
}: GameOverOverlayProps) {
  const { address, isConnected } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Fixed reward amount
  const FIXED_REWARD = "0.000000001"; // Fixed reward in MON

  const handleSubmitScore = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit score to database
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          score: score,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Generate a mock transaction hash for display
        const mockTxHash =
          "0x" +
          Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join("");

        setTxHash(mockTxHash);

        if (data.isNewHighScore) {
          alert(`🎉 ${data.message}\nReward: ${FIXED_REWARD} MON`);
        } else {
          alert(
            `${data.message}\nYour high score: ${data.currentHighScore}\nReward: ${FIXED_REWARD} MON`
          );
        }
      } else {
        throw new Error(data.error || "Failed to submit score");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("Failed to submit score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        {/* Pixel border effect */}
        <div className="pixel-border bg-gradient-to-b from-indigo-900 to-purple-900 p-8 rounded-lg">
          {/* Game Over title */}
          <div className="text-center mb-6">
            <h2 className="pixel-font text-3xl text-red-500 neon-glow mb-2">
              GAME OVER
            </h2>
            <div className="h-1 w-32 bg-red-500 mx-auto opacity-50"></div>
          </div>

          {/* Score display */}
          <div className="text-center mb-6 space-y-4">
            <div>
              <div className="pixel-font text-sm text-cyan-400 mb-2">SCORE</div>
              <div className="pixel-font text-5xl text-white neon-glow">
                {score}
              </div>
            </div>

            <div>
              <div className="pixel-font text-sm text-purple-400 mb-2">
                REWARD
              </div>
              <div className="pixel-font text-3xl text-purple-400 neon-glow">
                {FIXED_REWARD} MON
              </div>
              <div className="pixel-font text-xs text-white/60 mt-2">
                Fixed reward per game
              </div>
            </div>
          </div>

          {/* Transaction status */}
          {txHash && (
            <div className="mb-6 p-4 bg-green-900/30 border-2 border-green-500 rounded">
              <div className="pixel-font text-xs text-green-400 mb-2">
                ✓ SUBMITTED
              </div>
              <div className="text-xs text-white/60 break-all font-mono">
                {txHash.slice(0, 20)}...
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            {!txHash && isConnected && (
              <button
                onClick={handleSubmitScore}
                disabled={isSubmitting}
                className="w-full pixel-button pixel-font text-sm text-white uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting
                  ? "Verifying on Monad..."
                  : "Submit Score to Chain"}
              </button>
            )}

            {!isConnected && (
              <div className="text-center pixel-font text-xs text-yellow-400 mb-2">
                Connect wallet to submit score
              </div>
            )}

            <button
              onClick={onRestart}
              className="w-full pixel-button pixel-font text-sm text-white uppercase tracking-wider"
              style={{ background: "var(--color-pixel-cyan)" }}
            >
              Try Again
            </button>

            <button
              onClick={onHome}
              className="w-full pixel-button pixel-font text-sm text-white uppercase tracking-wider"
              style={{ background: "var(--color-pixel-indigo)" }}
            >
              Home
            </button>
          </div>

          {/* Connected wallet display */}
          {isConnected && address && (
            <div className="mt-4 text-center pixel-font text-xs text-white/40">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
