import { PrismaClient } from "@prisma/client";

class RewardService {
	prisma = new PrismaClient();

	// Calculate rewards for a creator
	async calculateRewards(creatorId: string) {
		// Fetch all received gifts
		const gifts = await this.prisma.transaction.findMany({
			where: { toId: creatorId },
			include: { content: true },
		});

		// Calculate rewards based on gift amount and content quality
		let totalReward = 0;
		const rewardDetails = gifts.map((gift) => {
			const qualityMultiplier = gift.content?.qualityScore || 1; // default multiplier
			const reward = gift.amount * qualityMultiplier;
			totalReward += reward;

			return {
				transactionId: gift.id,
				contentId: gift.contentId,
				amount: gift.amount,
				qualityScore: gift.content?.qualityScore,
				reward,
			};
		});

		// Store reward history
		for (const detail of rewardDetails) {
			await this.prisma.reward.create({
				data: {
					creatorId,
					transactionId: detail.transactionId,
					contentId: detail.contentId,
					rewardAmount: detail.reward,
				},
			});
		}

		return {
			totalReward,
			rewardDetails,
		};
	}

	// Get total rewards for a creator
	async getTotalRewards(creatorId: string) {
		const result = await this.prisma.reward.aggregate({
			_sum: {
				rewardAmount: true,
			},
			where: { creatorId },
		});
		return result._sum.rewardAmount || 0;
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
