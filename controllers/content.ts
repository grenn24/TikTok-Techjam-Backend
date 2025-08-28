import { Request, Response } from "express";
import contentService from "../services/content";

class ContentController {
	// Upload new content
	async uploadContent(req: Request, res: Response) {
		try {
			const { creatorId, type, title, description } = req.body;
			const content = await contentService.createContent({
				creatorId,
				type,
				title,
				description,
			});
			res.status(201).json(content);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

	// Get all content
	async getAllContent(req: Request, res: Response) {
		try {
			const filters = req.query; // optional filters like creatorId or type
			const contentList = await contentService.listContent(
				filters as any
			);
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

	// Update content quality score (manual or ML)
	async updateContentScore(req: Request, res: Response) {
		try {
			const contentId = req.params.id;
			const { score } = req.body;
			const updatedContent = await contentService.updateScore(
				contentId,
				score
			);
			res.json(updatedContent);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}
}

const contentController = new ContentController();
export default contentController;
