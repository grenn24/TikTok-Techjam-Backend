import { PrismaClient } from "@prisma/client";
import axios from "axios";
import config from "config";

class AuditService {
	prisma = new PrismaClient();

	async getAllAuditLogs() {
		return this.prisma.auditLog.findMany();
	}

	async scanAuditLogs() {
		const auditLogs = await this.prisma.auditLog.findMany();
		const response = await axios.post(
			`http://localhost:${config.get("ML_PORT")}/audit/anomaly-detection`,
			auditLogs
		);
		return response.data;
	}
}

const auditService = new AuditService();
export default auditService;
