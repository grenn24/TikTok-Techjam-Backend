import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import config from "config";

class GiftService {
	prisma = new PrismaClient();
	async sendGift(data: {
		creatorId: string;
		consumerId: string;
		contentId: string;
		amount: number;
	}) {
		const { creatorId, consumerId, contentId, amount } = data;

		const DAILY_GIFT_LIMIT = config.get<number>("DAILY_GIFT_LIMIT");

		// Daily Gift Limit Check
		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0);
		const todayGifts = await this.prisma.gift.findMany({
			where: {
				consumerId,
				createdAt: { gte: todayStart },
			},
		});
		const totalToday = todayGifts.reduce((sum, g) => sum + g.amount, 0);
		if (totalToday + amount > DAILY_GIFT_LIMIT) {
			throw new Error("Daily gift limit exceeded");
		}

		// Self-gifting detected
		if (consumerId === creatorId) {
			const logData = {
				userId: consumerId,
				action: "SUSPICIOUS_GIFTING" as const,
				description: `User attempted to gift themselves ${amount} tokens.`,
				amount,
				prevHash: "",
			};

			await this.prisma.auditLog.create({
				data: {
					...logData,
					hash: createHash("sha256")
						.update(JSON.stringify(logData))
						.digest("hex"),
				},
			});
			throw new Error(
				"Suspicious gifting detected: cannot gift yourself"
			);
		}

		// Check for potential gaming activities
		const recentGift = await this.prisma.gift.findFirst({
			where: {
				consumerId,
				creatorId,
				contentId,
				createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // last 1 hour
			},
		});
		if (recentGift) {
			const logData = {
				userId: consumerId,
				action: "POTENTIAL_GAMING" as const,
				description: `Repeated gifting detected to creator ${creatorId} for content ${contentId}`,
				amount,
				prevHash: "",
				giftId: recentGift.id,
			};
			await this.prisma.auditLog.create({
				data: {
					...logData,
					hash: createHash("sha256")
						.update(JSON.stringify(logData))
						.digest("hex"),
				},
			});
		}

		const transaction = await this.prisma.gift.create({
			data: {
				creatorId,
				consumerId,
				contentId,
				amount,
				status: "COMPLETED",
			},
		});

		// Update recipient wallet balance
		await this.prisma.user.update({
			where: { id: creatorId },
			data: { walletBalance: { increment: amount } },
		});

		// Get the latest audit log to get prevHash
		const latestLog = await this.prisma.auditLog.findFirst({
			orderBy: { createdAt: "desc" },
		});
		const prevHash = latestLog?.hash || "";

		// 4. Create the hash for this new entry
		const logData = {
			userId: consumerId,
			action: "SEND_GIFT" as const,
			description: `Sent ${amount} tokens to user ${creatorId} for content ${
				contentId ?? "N/A"
			}`,
			amount,
			prevHash,
			giftId: transaction.id,
		};
		const hash = createHash("sha256")
			.update(JSON.stringify(logData))
			.digest("hex");

		const giftLog = await this.prisma.auditLog.create({
			data: {
				...logData,
				hash,
			},
		});

		try {
			// Only get the most recent logs (last 1 hour)
			const recentLogs = await this.prisma.auditLog.findMany({
				where: {
					createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
				},
			});
			const response = await axios.post(
				`http://localhost:${config.get(
					"ML_PORT"
				)}/audit/anomaly-detection`,
				recentLogs
			);

			const { anomalies_detected, flagged_entries } = response.data;
			if (anomalies_detected > 0) {
				const flaggedIds = flagged_entries.map((entry) => entry.id);
				// Update current gift log if its suspicious
				if (flaggedIds.includes(giftLog.id)) {
					await this.prisma.auditLog.update({
						where: { id: giftLog.id },
						data: { action: "SUSPICIOUS_GIFTING" },
					});
				}
			}
		} catch (err) {
			console.error("Anomaly detection failed:", err.message);
		}

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
