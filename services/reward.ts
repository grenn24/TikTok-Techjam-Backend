import { PrismaClient } from "@prisma/client";
import config from "config";
import contentService from "./content";

class RewardService {
	prisma = new PrismaClient();

	// Calculate rewards for a creator
	async getTotalRewards(creatorId: string) {
		let totalGifts = 0;
		let averageContentQualityScore = 0;
		let totalContentQualityScore = 100;
		let averageViews = 0;
		let averageWatchTime = 0;
		let totalViews = 0;
		let totalWatchTime = 0;
		const AD_POOL = config.get<number>("ADVERTISEMENT_POOL");
		const CREATOR_FUND = config.get<number>("CREATOR_FUND");

		/*CALCULATE GIFTS*/
		const gifts = await this.prisma.gift.findMany({
			where: { creatorId: creatorId },
			include: { content: true },
		});
		const allContent = await this.prisma.content.findMany();
		const userContent = await this.prisma.content.findMany({
			where: { creatorId: creatorId },
		});

		for (const gift of gifts) {
			totalGifts += gift.amount;
		}

		/*CALCULATE CONTENT SCORES AND ENGAGEMENT*/
		for (const content of userContent) {
			let qualityScore = content.qualityScore;
			if (qualityScore === 0) {
				qualityScore = await contentService.generateContentQualityScore(
					content.id
				);
			}
			averageContentQualityScore += qualityScore / userContent.length;
			averageViews += content.views / userContent.length;
			averageWatchTime += content.watchTime / userContent.length;
		}
		for (const content of allContent) {
			totalWatchTime += content.watchTime;
			totalViews += content.views;
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

		/*DERIVE TOTAL REWARD VALUE*/
		const totalReward =
			0.4 * totalGifts +
			0.3 *
				((averageViews + averageWatchTime) /
					(totalViews + totalWatchTime)) *
				AD_POOL +
			0.3 *
				(averageContentQualityScore / totalContentQualityScore) *
				CREATOR_FUND;
		return totalReward;
	}
	async getRewardsBreakdown(creatorId: string) {
		const AD_POOL = config.get<number>("ADVERTISEMENT_POOL");
		const CREATOR_FUND = config.get<number>("CREATOR_FUND");

		/* 1️⃣ Fetch gifts and content */
		const gifts = await this.prisma.gift.findMany({
			where: { creatorId },
			include: { content: true },
		});
		const userContent = await this.prisma.content.findMany({
			where: { creatorId },
		});
		const allContent = await this.prisma.content.findMany();

		/* 2️⃣ Compute total engagement across all content (for ad revenue) */
		let totalViews = 0;
		let totalWatchTime = 0;
		for (const content of allContent) {
			totalViews += content.views;
			totalWatchTime += content.watchTime;
		}

		/* 3️⃣ Compute total content quality denominator for fund */
		let totalContentQualityScore = 100; // start at 100 to avoid divide by zero
		const otherUsers = await this.prisma.user.findMany({
			where: { NOT: { id: creatorId } },
		});
		for (const user of otherUsers) {
			if (user.averageContentQuality) {
				totalContentQualityScore += user.averageContentQuality;
			}
		}

		/* 4️⃣ Loop through each content to calculate per-content contributions */
		let contentBreakdown: any[] = [];
		let totalGifts = 0;

		for (const content of userContent) {
			// ML quality score
			let qualityScore = content.qualityScore;
			if (!qualityScore || qualityScore === 0) {
				qualityScore = await contentService.generateContentQualityScore(
					content.id
				);
				// persist score
				await this.prisma.content.update({
					where: { id: content.id },
					data: { qualityScore },
				});
			}

			// Gifts for this content
			const giftAmount = gifts
				.filter((g) => g.content?.id === content.id)
				.reduce((sum, g) => sum + g.amount, 0);
			const giftReward = giftAmount * 0.4;
			totalGifts += giftAmount;

			// Ad revenue based on engagement proportion
			const adRevenue =
				0.3 *
				((content.views + content.watchTime) /
					(totalViews + totalWatchTime)) *
				AD_POOL;

			// Fund contribution based on quality score proportion
			const fundReward =
				0.3 * (qualityScore / totalContentQualityScore) * CREATOR_FUND;

			// Sum total reward per content
			const totalRewardPerContent = giftReward + adRevenue + fundReward;

			contentBreakdown.push({
				contentId: content.id,
				title: content.title,
				giftReward,
				adRevenue,
				fundReward,
				totalReward: totalRewardPerContent,
			});
		}

		// 5️⃣ Compute total reward for creator
		const totalReward = contentBreakdown.reduce(
			(sum, c) => sum + c.totalReward,
			0
		);

		// 6️⃣ Compute percentage contribution per content
		contentBreakdown = contentBreakdown.map((c) => ({
			...c,
			percentageOfTotal:
				totalReward > 0 ? (c.totalReward / totalReward) * 100 : 0,
		}));

		// 7️⃣ Update average content quality for creator
		const averageContentQualityScore =
			userContent.reduce((sum, c) => sum + (c.qualityScore ?? 0), 0) /
			Math.max(userContent.length, 1);
		await this.prisma.user.update({
			where: { id: creatorId },
			data: { averageContentQuality: averageContentQualityScore },
		});

		/* 8️⃣ Return full breakdown */
		return {
			totalReward,
			totalGifts,
			adPool: AD_POOL,
			creatorFund: CREATOR_FUND,
			averageContentQualityScore,
			contentBreakdown,
		};
	}
}

const rewardService = new RewardService();
export default rewardService;
