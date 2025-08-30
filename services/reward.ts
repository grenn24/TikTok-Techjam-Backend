import { PrismaClient } from "@prisma/client";
import config from "config";
import contentService from "./content";

class RewardService {
	prisma = new PrismaClient();

	// Calculate rewards for a creator
	async getTotalRewards(creatorId: string) {
		let totalGifts = 0;
		let averageEngagementScore = 0;
		let averageQualityScore = 0;
		let totalEngagementScore = 100;
		let totalQualityScore = 100;
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
			const engagementScore = await contentService.generateQualityScore(
				content.id
			);
			const qualityScore = await contentService.generateQualityScore(
				content.id
			);
			averageEngagementScore += engagementScore / userContent.length;
			averageQualityScore += qualityScore / userContent.length;
			averageViews += content.views / userContent.length;
			averageWatchTime += content.watchTime / userContent.length;
		}
		for (const content of allContent) {
			totalWatchTime += content.watchTime;
			totalViews += content.views;
		}
		await this.prisma.user.update({
			where: { id: creatorId },
			data: {
				averageContentEngagement: averageEngagementScore,
				averageContentQuality: averageQualityScore,
			},
		});

		const otherUsers = await this.prisma.user.findMany({
			where: { NOT: { id: creatorId } },
		});
		for (const user of otherUsers) {
			if (user.averageContentQuality) {
				totalEngagementScore += user.averageContentQuality;
			}
		}
		for (const user of otherUsers) {
			if (user.averageContentEngagement) {
				totalQualityScore += user.averageContentEngagement;
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
				(0.5 * (averageEngagementScore / totalEngagementScore) +
					0.5 * (averageQualityScore / totalQualityScore)) *
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
		let totalEngagementScore = 100; // start at 100 to avoid divide by zero
		const otherUsers = await this.prisma.user.findMany({
			where: { NOT: { id: creatorId } },
		});
		for (const user of otherUsers) {
			if (user.averageContentQuality) {
				totalEngagementScore += user.averageContentQuality;
			}
		}

		/* 4️⃣ Loop through each content to calculate per-content contributions */
		let contentBreakdown: any[] = [];
		let totalGifts = 0;

		for (const content of userContent) {
			const qualityScore = await contentService.generateQualityScore(
				content.id
			);

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
				0.3 * (qualityScore / totalEngagementScore) * CREATOR_FUND;

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

		let averageEngagementScore = 0;
		for (const content of userContent) {
			const qualityScore = await contentService.generateQualityScore(
				content.id
			);
			averageEngagementScore +=
				qualityScore / Math.max(userContent.length, 1);
		}
		await this.prisma.user.update({
			where: { id: creatorId },
			data: { averageContentQuality: averageEngagementScore },
		});

		return {
			totalReward,
			totalGifts,
			adPool: AD_POOL,
			creatorFund: CREATOR_FUND,
			averageEngagementScore,
			contentBreakdown,
		};
	}
}

const rewardService = new RewardService();
export default rewardService;
