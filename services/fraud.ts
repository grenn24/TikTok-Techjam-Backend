import { PrismaClient } from "@prisma/client";

class FraudService {
	prisma = new PrismaClient();

	// Report suspicious activity
	async report(transactionId: string, reason: string) {
		// Optional: Check if transaction exists
		const transaction = await this.prisma.gift.findUnique({
			where: { id: transactionId },
		});
		if (!transaction) throw new Error("Transaction not found");

		// Log a fraud report
		const report = await this.prisma.fraudLog.create({
			data: {
				giftId: transaction.id, // link to sender
				type: "FRAUD", // enum: FRAUD or AML
				description: reason, // use description instead of reason
			},
		});

		return report;
	}

	// List all flagged transactions
	async listFlags() {
		return this.prisma.fraudLog.findMany({
			orderBy: { createdAt: "desc" },
			include: { gift: true },
		});
	}

	// Check a specific transaction for fraud
	async checkTransaction(transactionId: string) {
		const transaction = await this.prisma.gift.findUnique({
			where: { id: transactionId },
			include: { from: true, to: true },
		});
		if (!transaction) throw new Error("Transaction not found");

		const fraudLog = await this.prisma.fraudLog.findFirst({
			where: { giftId: transactionId },
		});
		if (fraudLog) {
			return fraudLog;
		}
	}
}

const fraudService = new FraudService();
export default fraudService;
