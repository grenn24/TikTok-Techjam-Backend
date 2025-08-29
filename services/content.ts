import { PrismaClient } from "@prisma/client";

class ContentService {
	prisma = new PrismaClient();

	// Create/upload new content
	async createContent(data: {
		creatorId: string;
		type: "VIDEO" | "LIVE";
		title: string;
		description?: string;
	}) {
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

	// Update content quality score (manual or ML)
	async updateScore(contentId: string, score: number) {
		const updatedContent = await this.prisma.content.update({
			where: { id: contentId },
			data: { qualityScore: score },
		});
		return updatedContent;
	}
}

const contentService = new ContentService();
export default contentService;
