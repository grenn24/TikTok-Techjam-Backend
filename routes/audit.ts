import auditController from "controllers/audit";
import authController from "controllers/auth";
import express from "express";
import auth from "middlewares/auth";

const auditRoutes = express.Router();

auditRoutes.use(auth("User"));

auditRoutes.get("/", auditController.getAllAuditLogs.bind(authController));

export default auditRoutes;
