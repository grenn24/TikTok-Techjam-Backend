import { PrismaClient } from "@prisma/client";
import contentService from "./content";

class RewardService {
	prisma = new PrismaClient();

	// Calculate rewards for a creator
	async getTotalRewards(creatorId: string) {
		// Fetch all received gifts for that creator
		const gifts = await this.prisma.gift.findMany({
			where: { creatorId: creatorId },
			include: { content: true },
		});
		const contents = await this.prisma.content.findMany({
			where: { creatorId: creatorId },
		});
		// Calculate rewards based on gift amount (45%) and creator fund for content quality (10%)
		let totalReward = 0;
		for (const gift of gifts) {
			totalReward += gift.amount * 0.45;
		}
		for (const content of contents) {
			let qualityScore = content.qualityScore;
			if (qualityScore === 0) {
				qualityScore = await contentService.generateContentQualityScore(
					content.id
				);
			}
			totalReward += qualityScore * 0.1;
		}

		return totalReward;
	}

	// List reward history for a creator
	async listRewardHistory(creatorId: string) {
		return this.prisma.reward.findMany({
			where: { creatorId },
			orderBy: { createdAt: "desc" },
		});
	}
}

const rewardService = new RewardService();
export default rewardService;
