"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LeaderboardEntry {
  address: string;
  score: number;
  reward: string;
  timestamp: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalRewards, setTotalRewards] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/leaderboard", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await response.json();

      if (data.success) {
        setEntries(data.leaderboard || []);
        setTotalPlayers(data.totalPlayers || 0);
        setTotalRewards(data.totalRewards || "0.00");
      } else {
        throw new Error(data.error || "Failed to load leaderboard");
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Unable to load leaderboard. Please try again.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen game-container relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="pixel-button pixel-font text-xs text-white uppercase tracking-wider"
            style={{
              background: "var(--color-pixel-indigo)",
              padding: "8px 16px",
            }}
          >
            ← Back
          </button>
          <h1 className="pixel-font text-2xl md:text-4xl text-center text-purple-400 neon-glow">
            LEADERBOARD
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Leaderboard panel */}
        <div className="pixel-border bg-gradient-to-b from-indigo-950/80 to-purple-950/80 backdrop-blur-sm rounded-lg overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-10 gap-4 p-4 border-b-2 border-cyan-500/30 bg-black/30">
            <div className="col-span-1 pixel-font text-xs text-cyan-400">#</div>
            <div className="col-span-3 pixel-font text-xs text-cyan-400">
              WALLET
            </div>
            <div className="col-span-2 pixel-font text-xs text-cyan-400 text-center">
              SCORE
            </div>
            <div className="col-span-2 pixel-font text-xs text-cyan-400 text-center">
              REWARD
            </div>
            <div className="col-span-2 pixel-font text-xs text-cyan-400 text-right">
              TIME
            </div>
          </div>

          {/* Leaderboard entries */}
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="pixel-font text-white neon-glow animate-pulse">
                  Loading leaderboard...
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="pixel-font text-red-400 mb-4">{error}</div>
                <button
                  onClick={fetchLeaderboard}
                  className="pixel-button pixel-font text-xs text-white uppercase tracking-wider"
                  style={{
                    background: "var(--color-pixel-cyan)",
                    padding: "8px 16px",
                  }}
                >
                  Retry
                </button>
              </div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center">
                <div className="pixel-font text-white/60 mb-2">
                  No scores yet!
                </div>
                <div className="text-xs text-white/40">
                  Be the first to play and submit your score
                </div>
              </div>
            ) : (
              entries.map((entry, index) => (
                <div
                  key={entry.address}
                  className="grid grid-cols-10 gap-4 p-4 border-b border-purple-500/10 hover:bg-purple-500/10 transition-colors"
                >
                  {/* Rank */}
                  <div className="col-span-1 pixel-font text-sm text-white flex items-center">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && index + 1}
                  </div>

                  {/* Address */}
                  <div className="col-span-3 font-mono text-xs text-purple-300 flex items-center truncate">
                    {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                  </div>

                  {/* Score */}
                  <div className="col-span-2 pixel-font text-sm text-white text-center flex items-center justify-center">
                    {entry.score}
                  </div>

                  {/* Reward */}
                  <div className="col-span-2 pixel-font text-sm text-purple-400 text-center flex items-center justify-center neon-glow">
                    {entry.reward}
                  </div>

                  {/* Time */}
                  <div className="col-span-2 text-xs text-white/60 text-right flex items-center justify-end">
                    {entry.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer stats */}
          <div className="p-4 border-t-2 border-cyan-500/30 bg-black/30">
            <div className="flex justify-between items-center">
              <div className="pixel-font text-xs text-cyan-400">
                TOTAL PLAYERS: {totalPlayers}
              </div>
              <div className="pixel-font text-xs text-purple-400 neon-glow">
                TOTAL REWARDS: {totalRewards} MON
              </div>
            </div>
          </div>
        </div>

        {/* Info text */}
        <div className="text-center mt-6 pixel-font text-xs text-white/40">
          Rankings updated every 10 minutes
        </div>
      </div>
    </div>
  );
}
