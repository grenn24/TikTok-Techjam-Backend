import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";

class GiftService {
	prisma = new PrismaClient();
	async sendGift(data: {
		creatorId: string;
		consumerId: string;
		contentId: string;
		amount: number;
	}) {
		const { creatorId, consumerId, contentId, amount } = data;
		// 1. Create the transaction
		const transaction = await this.prisma.gift.create({
			data: {
				creatorId,
				consumerId,
				contentId,
				amount,
				status: "COMPLETED",
			},
		});

		// 2. Update recipient wallet balance
		await this.prisma.user.update({
			where: { id: creatorId },
			data: { walletBalance: { increment: amount } },
		});

		// 3. Get the latest audit log to get prevHash
		const latestLog = await this.prisma.auditLog.findFirst({
			orderBy: { createdAt: "desc" },
		});
		const prevHash = latestLog?.hash || "";

		// 4. Create the hash for this new entry
		const logData = {
			userId: consumerId,
			action: "SEND_GIFT",
			description: `Sent ${amount} tokens to user ${creatorId} for content ${
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
			where: { consumerId: userId },
			include: { creator: true, content: true },
			orderBy: { createdAt: "desc" },
		});
	}

	// List gifts received by a creator
	async listReceivedGifts(userId: string) {
		return this.prisma.gift.findMany({
			where: { creatorId: userId },
			include: { consumer: true, content: true },
			orderBy: { createdAt: "desc" },
		});
	}
}

const giftService = new GiftService();
export default giftService;
