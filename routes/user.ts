import express from "express";
import userService from "../services/user";
import userController from "../controllers/user";

const userRoutes = express.Router();

// Define the route handlers

// Get user profile
userRoutes.get("/:id", userController.getUser);

// Update user profile or wallet
userRoutes.put("/:id", userController.updateUser);


export default userRoutes;
