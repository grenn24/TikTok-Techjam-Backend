import { PrismaClient } from "@prisma/client";

class GiftService {
	prisma = new PrismaClient();

	async sendGift(data: {
		fromId: string;
		toId: string;
		contentId?: string;
		amount: number;
	}) {
		const { fromId, toId, contentId, amount } = data;

		// 1. Create the transaction
		const transaction = await this.prisma.gift.create({
			data: {
				fromId,
				toId,
				contentId,
				amount,
				status: "COMPLETED", // or PENDING if approval needed
			},
		});

		// 2. Update recipient wallet balance
		await this.prisma.user.update({
			where: { id: toId },
			data: { walletBalance: { increment: amount } },
		});

		// 3. Write to AuditLog (immutable ledger)
		await this.prisma.auditLog.create({
			data: {
				userId: fromId, // who initiated the action
				action: "SEND_GIFT",
				description: `Sent ${amount} tokens to user ${toId} for content ${
					contentId ?? "N/A"
				}`,
				metadata: {
					transactionId: transaction.id,
					toId,
					contentId,
					amount,
				},
			},
		});

		return transaction;
	}

	// List gifts sent by a user
	async listSentGifts(userId: string) {
		return this.prisma.gift.findMany({
			where: { fromId: userId },
			include: { to: true, content: true },
			orderBy: { createdAt: "desc" },
		});
	}

	// List gifts received by a creator
	async listReceivedGifts(userId: string) {
		return this.prisma.gift.findMany({
			where: { toId: userId },
			include: { from: true, content: true },
			orderBy: { createdAt: "desc" },
		});
	}
}

const giftService = new GiftService();
export default giftService;
