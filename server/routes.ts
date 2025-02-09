import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isSameDay } from "date-fns";
import { insertClaimSchema, DAILY_REWARDS } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  app.get("/api/bonus/status", async (req, res) => {
    // For demo, use a fixed user ID of 1
    const userId = 1;
    const user = await storage.getUser(userId);
    const latestClaim = await storage.getLatestClaim(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get day of week (1-7, where 1 is Monday)
    const today = new Date().getDay() || 7;
    const reward = DAILY_REWARDS[today as keyof typeof DAILY_REWARDS];

    const canClaim = !latestClaim || !isSameDay(latestClaim.claimedAt, new Date());
    res.json({ 
      canClaim, 
      lastClaim: latestClaim?.claimedAt,
      metaCoins: user.metaCoins,
      tokens: user.tokens,
      todayReward: reward,
      weeklyRewards: DAILY_REWARDS
    });
  });

  app.post("/api/bonus/claim", async (req, res) => {
    // For demo, use a fixed user ID of 1
    const userId = 1;
    const latestClaim = await storage.getLatestClaim(userId);

    if (latestClaim && isSameDay(latestClaim.claimedAt, new Date())) {
      return res.status(400).json({ message: "Already claimed today's bonus" });
    }

    // Get day of week (1-7, where 1 is Monday)
    const today = new Date().getDay() || 7;
    const coinsEarned = DAILY_REWARDS[today as keyof typeof DAILY_REWARDS];

    const parsed = insertClaimSchema.parse({ userId, coinsEarned });
    const claim = await storage.createClaim(parsed);

    // Update user's meta coins
    const user = await storage.updateUserCoins(userId, coinsEarned);

    res.json({
      message: `Daily bonus of ${coinsEarned} MetaCoins claimed successfully!`,
      claimedAt: claim.claimedAt,
      metaCoins: user.metaCoins,
      tokens: user.tokens
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}