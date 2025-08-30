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

	// used for sus activity report
	async flag(req: Request, res: Response) {
		const user = res.locals.user;
		const flag = await auditService.flag(user, req.body, req.params.id);
		res.status(200).json(flag);
	}
}
const auditController = new AuditController();
export default auditController;
