"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import StartScreen from "@/components/StartScreen";
import GameOverOverlay from "@/components/GameOverOverlay";
import GameHUD from "@/components/GameHUD";

// Dynamic import to avoid SSR issues with Phaser
const PhaserGame = dynamic(() => import("@/components/PhaserGame"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen game-container">
      <div className="pixel-font text-white neon-glow animate-pulse">
        Loading Game...
      </div>
    </div>
  ),
});

type GameState = "start" | "playing" | "gameover";

export default function Home() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("start");
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const handlePlay = (txHash?: string) => {
    setGameState("playing");
    setScore(0);
    setFinalScore(0);
  };

  const handleGameOver = (finalScore: number) => {
    setFinalScore(finalScore);
    setGameState("gameover");
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  const handleRestart = () => {
    setGameState("playing");
    setScore(0);
    setFinalScore(0);
    // Force remount of game
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleHome = () => {
    setGameState("start");
    setScore(0);
    setFinalScore(0);
  };

  const handleLeaderboard = () => {
    router.push("/leaderboard");
  };

  return (
    <>
      {gameState === "start" && (
        <StartScreen onPlay={handlePlay} onLeaderboard={handleLeaderboard} />
      )}

      {gameState === "playing" && (
        <div className="relative w-full h-screen game-container overflow-hidden">
          <GameHUD score={score} />
          <PhaserGame
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
          />
        </div>
      )}

      {gameState === "gameover" && (
        <div className="relative w-full h-screen game-container overflow-hidden">
          <PhaserGame
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
          />
          <GameOverOverlay
            score={finalScore}
            onRestart={handleRestart}
            onHome={handleHome}
          />
        </div>
      )}
    </>
  );
}
