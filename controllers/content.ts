import { Request, Response } from "express";
import contentService from "../services/content";

class ContentController {
	// Upload new content
	async uploadContent(req: Request, res: Response) {
		try {
			const content = await contentService.createContent(req.body);
			res.status(201).json(content);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

	// Get all content by a user
	async getContentByUser(req: Request, res: Response) {
		try {
			const filters = req.query;
			const user = res.locals.user;
			const contentList = await contentService.listContent({
				creatorId: user.id,
				...filters,
			});
			res.json(contentList);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

	// Get content by ID
	async getContentById(req: Request, res: Response) {
		try {
			const contentId = req.params.id;
			const content = await contentService.getContent(contentId);
			res.json(content);
		} catch (err: any) {
			res.status(404).json({ error: err.message });
		}
	}

	// Generate content engagement score
	async generateEngagementScore(req: Request, res: Response) {
		try {
			const contentId = req.params.id;
			const score = await contentService.generateEngagementScore(
				contentId
			);
			res.json(score);
		} catch (err: any) {
			res.status(404).json({ error: err.message });
		}
	}

	// Update content info
	async updateContent(req: Request, res: Response) {
		try {
			const contentId = req.params.id;
			const updates = req.body;
			const updatedContent = await contentService.updateContent(
				contentId,
				updates
			);
			res.json(updatedContent);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}
}

const contentController = new ContentController();
export default contentController;
