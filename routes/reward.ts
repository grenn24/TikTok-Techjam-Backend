import express from "express";
import rewardController from "../controllers/reward";
import { auth } from "../middlewares/auth";

const rewardRoutes = express.Router();

// Middleware: all reward routes require authentication
rewardRoutes.use(auth("User"));

// Calculate rewards for a creator
rewardRoutes.post(
	"/calculate/:creatorId",
	rewardController.calculateRewards.bind(rewardController)
);

// Get total rewards for a creator
rewardRoutes.get(
	"/total/:creatorId",
	rewardController.getTotalRewards.bind(rewardController)
);

// Optional: list reward history
rewardRoutes.get(
	"/history/:creatorId",
	rewardController.listRewardHistory.bind(rewardController)
);

export default rewardRoutes;
