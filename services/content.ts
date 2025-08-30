import { PrismaClient } from "@prisma/client";
import axios from "axios";
import config from "config";
import userService from "./user";

interface ContentQuality {
	engagement: {
		score: number;
		feedback: string;
	};
	delivery: {
		score: number;
		feedback: string;
	};
	education: {
		score: number;
		feedback: string;
	};
	communityGuidelines: {
		score: number;
		feedback: string;
	};
	audioVisual: {
		score: number;
		feedback: string;
	};
}
const CONTENT_QUALITY_TMP = {
	engagement: {
		score: 35,
		feedback: "asgager",
	},
	delivery: {
		score: 0,
		feedback: "weg",
	},
	education: {
		score: 35,
		feedback: "weg",
	},
	communityGuidelines: {
		score: 23,
		feedback: "wEG",
	},
	audioVisual: {
		score: 35,
		feedback: "WEWE",
	},
};
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
		return {
			...content,
			contentQuality: CONTENT_QUALITY_TMP,
		};
	}

	// Get a content item by ID
	async getContent(contentId: string) {
		const content = await this.prisma.content.findUnique({
			where: { id: contentId },
			include: { creator: true, gifts: true },
		});
		if (!content) throw new Error("Content not found");
		return {
			...content,
			contentQuality: CONTENT_QUALITY_TMP,
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
		return contentList.map((content) => ({
			...content,
			contentQuality: CONTENT_QUALITY_TMP,
		}))
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
}

const contentService = new ContentService();
export default contentService;
