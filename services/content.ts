import { PrismaClient } from "@prisma/client";
import axios from "axios";
import config from "config";
import userService from "./user";

class ContentService {
	prisma = new PrismaClient();

	// Create/upload new content
	async createContent(data) {
		const content = await this.prisma.content.create({
			data,
		});
		return content;
	}

	// Get a content item by ID
	async getContent(contentId: string) {
		const content = await this.prisma.content.findUnique({
			where: { id: contentId },
			include: { creator: true, gifts: true },
		});
		if (!content) throw new Error("Content not found");
		return content;
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
		return contentList;
	}

	// Update content info (title, description)
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

	async generateContentQualityScore(contentId: string) {
		try {
			const content = await this.getContent(contentId);

			// calculate creator reputation (from 0 to 1)
			const reputation = await userService.generateReputation(content.creatorId)
			const features = {
				likes: content.likes,
				shares: content.shares,
				comments: content.commentCount,
				watchTime: content.watchTime,
				contentLength: content.length,
				creatorReputation: reputation,
			};

			const response = await axios.post(
				`http://localhost:${config.get("ML_PORT")}/content-quality`,
				features
			);
			const updatedContent = await this.prisma.content.update({
				where: { id: contentId },
				data: {
					qualityScore: response.data.qualityScore,
				},
			});
			return updatedContent.qualityScore;
		} catch (err) {
			console.error("ML service error:", err);
			return 1; // default multiplier if ML fails
		}
	}
}

const contentService = new ContentService();
export default contentService;
