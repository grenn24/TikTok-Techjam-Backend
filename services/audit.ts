import { PrismaClient } from "@prisma/client";

class AuditService {
    prisma = new PrismaClient();

    async getAllAuditLogs() {
        return this.prisma.auditLog.findMany();
    }
}

const auditService = new AuditService();
export default auditService;