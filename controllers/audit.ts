import { Request, Response } from "express";
import auditService from "services/audit";

class AuditController {
	async getAllAuditLogs(req: Request, res: Response) {
		const auditLogs = await auditService.getAllAuditLogs();
		res.status(200).json(auditLogs);
	}
}
const auditController = new AuditController();
export default auditController;
