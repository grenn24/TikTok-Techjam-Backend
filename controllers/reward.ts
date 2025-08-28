import { Request, Response } from "express";
import rewardService from "../services/reward";

class RewardController {
	// Calculate rewards for a creator (based on gifts & content quality)
	async calculateRewards(req: Request, res: Response) {
		try {
			const creatorId = req.params.creatorId;
			const rewards = await rewardService.calculateRewards(creatorId);
			res.json(rewards);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

	// Get total accumulated rewards for a creator
	async getTotalRewards(req: Request, res: Response) {
		try {
			const creatorId = req.params.creatorId;
			const total = await rewardService.getTotalRewards(creatorId);
			res.json({ totalRewards: total });
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

	// Optional: list reward history
	async listRewardHistory(req: Request, res: Response) {
		try {
			const creatorId = req.params.creatorId;
			const history = await rewardService.listRewardHistory(creatorId);
			res.json(history);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}
}

const rewardController = new RewardController();
export default rewardController;
