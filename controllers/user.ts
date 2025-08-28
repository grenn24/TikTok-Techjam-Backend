import { Request, Response } from "express";
import userService from "../services/user";

class UserController {
	// GET /users/:id
	async getUser(req: Request, res: Response) {
		try {
			const userId = req.params.id;
			const user = await userService.getUser(userId);
			res.json(user);
		} catch (err: any) {
			res.status(404).json({ error: err.message });
		}
	}

	// PUT /users/:id
	async updateUser(req: Request, res: Response) {
		try {
			const userId = req.params.id;
			const updates = req.body;
			const updatedUser = await userService.updateUser(userId, updates);
			res.json(updatedUser);
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}

	// POST /users/:id/wallet/add
	async addToWallet(req: Request, res: Response) {
		try {
			const userId = req.params.id;
			const { amount } = req.body;
			const newBalance = await userService.addToWallet(userId, amount);
			res.json({ walletBalance: newBalance });
		} catch (err: any) {
			res.status(400).json({ error: err.message });
		}
	}
}

const userController = new UserController();
export default userController;
