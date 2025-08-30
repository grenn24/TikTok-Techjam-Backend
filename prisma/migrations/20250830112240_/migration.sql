-- CreateTable
CREATE TABLE "public"."SuspiciousActivityReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "auditLogId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuspiciousActivityReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SuspiciousActivityReport" ADD CONSTRAINT "SuspiciousActivityReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SuspiciousActivityReport" ADD CONSTRAINT "SuspiciousActivityReport_auditLogId_fkey" FOREIGN KEY ("auditLogId") REFERENCES "public"."AuditLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
