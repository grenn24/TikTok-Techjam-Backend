import express from "express";
import fraudController from "../controllers/fraud";
import { auth } from "../middlewares/auth";

const fraudRoutes = express.Router();

// Middleware: all fraud routes require authentication
fraudRoutes.use(auth("User"));

// Report suspicious activity (e.g., fake gift, wallet manipulation)
fraudRoutes.post("/report", fraudController.reportFraud.bind(fraudController));

// List flagged transactions or users
fraudRoutes.get("/flags", fraudController.listFlags.bind(fraudController));

// Optional: check a specific transaction
fraudRoutes.get(
	"/check/:transactionId",
	fraudController.checkTransaction.bind(fraudController)
);

export default fraudRoutes;
