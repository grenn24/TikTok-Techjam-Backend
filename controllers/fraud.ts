import { Request, Response } from "express";
import fraudService from "../services/fraud";

class FraudController {
	// Report suspicious activity
	async reportFraud(req: Request, res: Response) {
		try {
			const { transactionId, reason } = req.body;
			const report = await fraudService.report(transactionId, reason);
			res.status(201).json(report);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

	// List flagged transactions or users
	async listFlags(req: Request, res: Response) {
		try {
			const flags = await fraudService.listFlags();
			res.json(flags);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

	// Check a specific transaction
	async checkTransaction(req: Request, res: Response) {
		try {
			const transactionId = req.params.transactionId;
			const result = await fraudService.checkTransaction(transactionId);
			res.json(result);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}
}

const fraudController = new FraudController();
export default fraudController;
