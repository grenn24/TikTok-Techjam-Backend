import { Request, Response } from "express";
import auditService from "services/audit";

class AuditController {
	async getAllAuditLogs(req: Request, res: Response) {
		const auditLogs = await auditService.getAllAuditLogs();
		res.status(200).json(auditLogs);
	}

	async getAuditLogsByID(req: Request, res: Response) {
		const auditLogs = await auditService.getAuditLogsByID(req.params.id);
		res.status(200).json(auditLogs);
	}

	async scanAuditLogs(req: Request, res: Response) {
		const auditLogs = await auditService.scanAuditLogs();
		res.status(200).json(auditLogs);
	}

	async listFlags(req: Request, res: Response) {
		const flags = await auditService.listFlags();
		res.status(200).json(flags);
	}
}
const auditController = new AuditController();
export default auditController;
