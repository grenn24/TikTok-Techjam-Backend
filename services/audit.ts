import { PrismaClient } from "@prisma/client";
import axios from "axios";
import config from "config";

class AuditService {
	prisma = new PrismaClient();

	async getAllAuditLogs() {
		return this.prisma.auditLog.findMany();
	}

	async getAuditLogsByID(id: string) {
		return this.prisma.auditLog.findUnique({ where: { id } });
	}

	async scanAuditLogs() {
		const auditLogs = await this.prisma.auditLog.findMany();
		const response = await axios.post(
			`http://localhost:${config.get("ML_PORT")}/audit/anomaly-detection`,
			auditLogs
		);
		return response.data;
	}

	async listFlags() {
		return this.prisma.auditLog.findMany({
			where: {
				action: {
					in: ["SUSPICIOUS_GIFTING", "POTENTIAL_GAMING"],
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async flag(user, data, auditLogId: string) {
		const auditLog = await this.prisma.auditLog.findUnique({
			where: { id: auditLogId },
		});
		if (!auditLog) throw new Error("Audit log not found");

		return this.prisma.suspiciousActivityReport.create({
			data: { ...data, auditLogId: auditLog.id, reporterId: user.id },
		});
	}
}

const auditService = new AuditService();
export default auditService;
