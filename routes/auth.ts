import authController from "controllers/auth";
import express from "express";

const authRoutes = express.Router();

// ----------------- SIGN UP -----------------
authRoutes.post("/signup", authController.signup.bind(authController));

// ----------------- LOGIN -----------------
authRoutes.post("/login", authController.login.bind(authController));

export default authRoutes;
