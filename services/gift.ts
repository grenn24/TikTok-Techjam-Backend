import { createHash } from "crypto";
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
				status: "COMPLETED",
			},
		});

		// 2. Update recipient wallet balance
		await this.prisma.user.update({
			where: { id: toId },
			data: { walletBalance: { increment: amount } },
		});

		// 3. Get the latest audit log to get prevHash
		const latestLog = await this.prisma.auditLog.findFirst({
			orderBy: { createdAt: "desc" },
		});
		const prevHash = latestLog?.hash || "";

		// 4. Create the hash for this new entry
		const logData = {
			userId: fromId,
			action: "SEND_GIFT",
			description: `Sent ${amount} tokens to user ${toId} for content ${
				contentId ?? "N/A"
			}`,
			amount,
			prevHash,
		};
		const hash = createHash("sha256")
			.update(JSON.stringify(logData))
			.digest("hex");

		// 5. Write to AuditLog
		await this.prisma.auditLog.create({
			data: {
				...logData,
				hash,
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
