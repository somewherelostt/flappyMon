import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const FIXED_REWARD = "0.000000001"; // Fixed reward in MON

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("flappy-alien");
    const collection = db.collection("scores");

    // Get top 100 scores
    const scores = await collection
      .find({})
      .sort({ score: -1, timestamp: -1 })
      .limit(100)
      .toArray();

    // Calculate relative timestamps
    const now = Date.now();
    const leaderboard = scores.map((entry: any) => {
      const timeDiff = now - entry.timestamp;
      const minutes = Math.floor(timeDiff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      let timeAgo: string;
      if (days > 0) {
        timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
      } else if (hours > 0) {
        timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else if (minutes > 0) {
        timeAgo = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      } else {
        timeAgo = "Just now";
      }

      return {
        address: entry.walletAddress,
        score: entry.score,
        reward: FIXED_REWARD,
        timestamp: timeAgo,
        rawTimestamp: entry.timestamp,
      };
    });

    const totalRewards = leaderboard.length * parseFloat(FIXED_REWARD);

    return NextResponse.json({
      success: true,
      leaderboard,
      totalPlayers: leaderboard.length,
      totalRewards: totalRewards.toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, score } = body;

    if (!walletAddress || typeof score !== "number") {
      return NextResponse.json(
        { success: false, error: "Invalid data" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("flappy-alien");
    const collection = db.collection("scores");

    // Check if user already has a score
    const existingScore = await collection.findOne({ walletAddress });

    if (existingScore) {
      // Only update if new score is higher
      if (score > existingScore.score) {
        await collection.updateOne(
          { walletAddress },
          {
            $set: {
              score,
              timestamp: Date.now(),
              updatedAt: new Date(),
            },
          }
        );

        return NextResponse.json({
          success: true,
          message: "New high score recorded!",
          isNewHighScore: true,
          score,
          reward: FIXED_REWARD,
        });
      } else {
        return NextResponse.json({
          success: true,
          message: "Score submitted but not a new high score",
          isNewHighScore: false,
          currentHighScore: existingScore.score,
          score,
        });
      }
    } else {
      // Insert new score
      await collection.insertOne({
        walletAddress,
        score,
        timestamp: Date.now(),
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Score recorded!",
        isNewHighScore: true,
        score,
        reward: FIXED_REWARD,
      });
    }
  } catch (error) {
    console.error("Error submitting score:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit score" },
      { status: 500 }
    );
  }
}
