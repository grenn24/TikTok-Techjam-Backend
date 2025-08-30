import auditController from "controllers/audit";
import authController from "controllers/auth";
import express from "express";
import auth from "middlewares/auth";

const auditRoutes = express.Router();

auditRoutes.use(auth("User"));

auditRoutes.get("/", auditController.getAllAuditLogs.bind(authController));

auditRoutes.get("/:id", auditController.getAuditLogsByID.bind(authController));

auditRoutes.post("/scan", auditController.scanAuditLogs.bind(authController));

auditRoutes.get("/flagged", auditController.listFlags.bind(authController));

export default auditRoutes;
