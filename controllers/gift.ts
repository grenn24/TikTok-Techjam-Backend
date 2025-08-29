import { Request, Response } from "express";
import giftService from "../services/gift";

class GiftController {
	async sendGift(req: Request, res: Response) {
		try {
			const { consumerId, creatorId, contentId, amount } = req.body;
			const transaction = await giftService.sendGift({
				consumerId,
				creatorId,
				contentId,
				amount,
			});
			res.status(201).json(transaction);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

	async listSentGifts(req: Request, res: Response) {
		try {
			const userId = req.params.userId;
			const transactions = await giftService.listSentGifts(userId);
			res.json(transactions);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

	async listReceivedGifts(req: Request, res: Response) {
		try {
			const userId = req.params.userId;
			const transactions = await giftService.listReceivedGifts(userId);
			res.json(transactions);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}
}

const giftController = new GiftController();
export default giftController;
