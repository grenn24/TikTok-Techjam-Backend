import { PrismaClient } from "@prisma/client";

class GiftService {
	prisma = new PrismaClient();

	// Send a gift (creates a transaction)
	async sendGift(data: {
		fromId: string;
		toId: string;
		contentId?: string;
		amount: number;
	}) {
		const { fromId, toId, contentId, amount } = data;

		// Optional: You can add wallet balance checks or fraud prevention here
		const transaction = await this.prisma.transaction.create({
			data: {
				fromId,
				toId,
				contentId,
				amount,
				status: "COMPLETED", // or PENDING if you want approval logic
			},
		});

		// Update wallets atomically (optional, if using walletBalance)
		await this.prisma.user.update({
			where: { id: toId },
			data: { walletBalance: { increment: amount } },
		});

		return transaction;
	}

	// List gifts sent by a user
	async listSentGifts(userId: string) {
		return this.prisma.transaction.findMany({
			where: { fromId: userId },
			include: { to: true, content: true },
			orderBy: { createdAt: "desc" },
		});
	}

	// List gifts received by a creator
	async listReceivedGifts(userId: string) {
		return this.prisma.transaction.findMany({
			where: { toId: userId },
			include: { from: true, content: true },
			orderBy: { createdAt: "desc" },
		});
	}
}

const giftService = new GiftService();
export default giftService;
