import { PrismaClient } from "@prisma/client";
import config from "config";
import contentService from "./content";

class RewardService {
	prisma = new PrismaClient();

	// Calculate rewards for a creator
	async getTotalRewards(creatorId: string) {
		const gifts = await this.prisma.gift.findMany({
			where: { creatorId: creatorId },
			include: { content: true },
		});
		const contents = await this.prisma.content.findMany({
			where: { creatorId: creatorId },
		});

		let totalGifts = 0;
		let averageContentQualityScore = 0;
		let totalContentQualityScore = 100;
		const adPool = config.get<number>("ADVERTISEMENT_POOL");
		for (const gift of gifts) {
			totalGifts += gift.amount;
		}
		for (const content of contents) {
			let qualityScore = content.qualityScore;
			if (qualityScore === 0) {
				qualityScore = await contentService.generateContentQualityScore(
					content.id
				);
			}
			averageContentQualityScore += qualityScore / contents.length;
		}
		await this.prisma.user.update({
			where: { id: creatorId },
			data: { averageContentQuality: averageContentQualityScore },
		});

		const otherUsers = await this.prisma.user.findMany({
			where: { NOT: { id: creatorId } },
		});
		for (const user of otherUsers) {
			if (user.averageContentQuality) {
				totalContentQualityScore += user.averageContentQuality;
			}
		}

		const totalReward = totalGifts * 0.4 + (averageContentQualityScore / totalContentQualityScore) * adPool * 0.3;
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
