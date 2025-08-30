import express from "express";
import rewardController from "../controllers/reward";
import { auth } from "../middlewares/auth";

const rewardRoutes = express.Router();

// Middleware: all reward routes require authentication
rewardRoutes.use(auth("User"));

// Get total rewards for a creator
rewardRoutes.get(
	"/total/:creatorId",
	rewardController.getTotalRewards.bind(rewardController)
);

// Get a detailed breakdown of rewards
rewardRoutes.get(
	"/breakdown/:creatorId",
	rewardController.getRewardsBreakdown.bind(rewardController)
);

export default rewardRoutes;
