import { PrismaClient } from "@prisma/client";
import axios from "axios";
import config from "config";
import userService from "./user";

interface ScoreFeedback {
	score: number;
	feedback: string;
}

interface ContentQuality {
	communityGuidelines: ScoreFeedback;
	education: ScoreFeedback;
	delivery: ScoreFeedback;
	audioVisual: ScoreFeedback;
	length: ScoreFeedback;
}
class ContentService {
	prisma = new PrismaClient();

	// Create/upload new content
	async createContent(user, data) {
		const content = await this.prisma.content.create({
			data: {
				creatorId: user.id,
				...data,
			},
		});
		const contentQuality = await contentService.generateQualityScore(
			content.id
		);
		const engagement = await contentService.generateEngagementScore(
			content.id
		);
		await this.prisma.contentQuality.create({
			data: {
				contentId: content.id,
				communityGuidelinesScore:
					contentQuality.communityGuidelines.score,
				educationScore: contentQuality.education.score,
				deliveryScore: contentQuality.delivery.score,
				audioVisualScore: contentQuality.audioVisual.score,
				communityGuidelinesFeedback:
					contentQuality.communityGuidelines.feedback,
				educationFeedback: contentQuality.education.feedback,
				deliveryFeedback: contentQuality.delivery.feedback,
				audioVisualFeedback: contentQuality.audioVisual.feedback,
				lengthScore: contentQuality.length.score,
				lengthFeedback: contentQuality.length.feedback,
			},
		});

		return {
			...content,
			contentQuality,
			engagement,
		};
	}

	// Get a content item by ID
	async getContent(contentId: string) {
		const content = await this.prisma.content.findUnique({
			where: { id: contentId },
			include: { creator: true, gifts: true },
		});
		if (!content) throw new Error("Content not found");
		const contentQualityStruct =
			await this.prisma.contentQuality.findUnique({
				where: { contentId: content.id },
			});

		const contentQuality = contentQualityStruct
			? {
					communityGuidelines: {
						score: contentQualityStruct.communityGuidelinesScore,
						feedback:
							contentQualityStruct.communityGuidelinesFeedback,
					},
					education: {
						score: contentQualityStruct.educationScore,
						feedback: contentQualityStruct.educationFeedback,
					},
					delivery: {
						score: contentQualityStruct.deliveryScore,
						feedback: contentQualityStruct.deliveryFeedback,
					},
					audioVisual: {
						score: contentQualityStruct.audioVisualScore,
						feedback: contentQualityStruct.audioVisualFeedback,
					},
					length: {
						score: contentQualityStruct.lengthScore,
						feedback: contentQualityStruct.lengthFeedback,
					},
			  }
			: await contentService.generateQualityScore(content.id);
		const engagement = await contentService.generateEngagementScore(
			content.id
		);
		return {
			...content,
			contentQuality,
			engagement,
		};
	}

	// Get all content, optionally filtered by creator or type
	async listContent(filters?: {
		creatorId?: string;
		type?: "VIDEO" | "LIVE";
	}) {
		const contentList = await this.prisma.content.findMany({
			where: filters || {},
			include: { creator: true },
		});
		return await Promise.all(
			contentList.map(async (content) => {
				const contentQualityStruct =
					await this.prisma.contentQuality.findUnique({
						where: { contentId: content.id },
					});

				const contentQuality = contentQualityStruct
					? {
							communityGuidelines: {
								score: contentQualityStruct.communityGuidelinesScore,
								feedback:
									contentQualityStruct.communityGuidelinesFeedback,
							},
							education: {
								score: contentQualityStruct.educationScore,
								feedback:
									contentQualityStruct.educationFeedback,
							},
							delivery: {
								score: contentQualityStruct.deliveryScore,
								feedback: contentQualityStruct.deliveryFeedback,
							},
							audioVisual: {
								score: contentQualityStruct.audioVisualScore,
								feedback:
									contentQualityStruct.audioVisualFeedback,
							},
							length: {
								score: contentQualityStruct.lengthScore,
								feedback: contentQualityStruct.lengthFeedback,
							},
					  }
					: await contentService.generateQualityScore(content.id);
				const engagement = await contentService.generateEngagementScore(
					content.id
				);
				return {
					...content,
					contentQuality,
					engagement,
				};
			})
		);
	}

	// Update content info
	async updateContent(
		contentId: string,
		updates: Partial<{ title: string; description: string }>
	) {
		const updatedContent = await this.prisma.content.update({
			where: { id: contentId },
			data: updates,
		});
		return updatedContent;
	}

	async generateEngagementScore(contentId: string) {
		try {
			const content = await this.getContent(contentId);

			// calculate creator reputation (from 0 to 1)
			const reputation = await userService.generateReputation(
				content.creatorId
			);
			const features = {
				likes: content.likes,
				shares: content.shares,
				comments: content.commentCount,
				watchTime: content.watchTime,
				contentLength: content.length,
				creatorReputation: reputation,
				views: content.views,
			};

			const response = await axios.post(
				`http://localhost:${config.get(
					"ML_PORT"
				)}/content/engagement-score`,
				features
			);
			return response.data.engagementScore;
		} catch (err) {
			console.error("ML service error:", err);
			return 1; // default multiplier if ML fails
		}
	}

	async generateQualityScore(contentId: string): Promise<ContentQuality> {
		try {
			const content = await this.getContent(contentId);

			if (!content.url) {
				throw new Error("Content URL not found");
			}

			const response = await axios.post(
				`http://localhost:${config.get(
					"ML_PORT"
				)}/content/quality-score`,
				{
					url: content.url,
				}
			);
			return response.data;
		} catch (err) {
			console.error("ML service error:", err);
			throw err;
		}
	}
}

const contentService = new ContentService();
export default contentService;
