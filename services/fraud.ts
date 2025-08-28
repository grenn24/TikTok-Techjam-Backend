import { PrismaClient } from "@prisma/client";

class FraudService {
	prisma = new PrismaClient();

	// Report suspicious activity
	async report(transactionId: string, reason: string) {
		// Optional: Check if transaction exists
		const transaction = await this.prisma.transaction.findUnique({
			where: { id: transactionId },
		});
		if (!transaction) throw new Error("Transaction not found");

		// Log a fraud report
		const report = await this.prisma.fraudReport.create({
			data: {
				transactionId,
				reason,
				status: "PENDING", // could be REVIEWED later
			},
		});

		// Optionally flag the user
		await this.prisma.user.update({
			where: { id: transaction.fromId },
			data: { isFlagged: true },
		});

		return report;
	}

	// List all flagged transactions or reports
	async listFlags() {
		return this.prisma.fraudReport.findMany({
			orderBy: { createdAt: "desc" },
			include: { transaction: true },
		});
	}

	// Check a specific transaction for fraud
	async checkTransaction(transactionId: string) {
		const transaction = await this.prisma.transaction.findUnique({
			where: { id: transactionId },
			include: { from: true, to: true },
		});
		if (!transaction) throw new Error("Transaction not found");

		// Simple check: flagged user or suspicious amount
		const flagged = transaction.from.isFlagged || transaction.amount > 1000; // example threshold

		return {
			transaction,
			flagged,
			reason: flagged
				? "High amount or flagged sender"
				: "No issues detected",
		};
	}
}

const fraudService = new FraudService();
export default fraudService;
