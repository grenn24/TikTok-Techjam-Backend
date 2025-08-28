import express from "express";
import userController from "../controllers/user";

const userRoutes = express.Router();

// Get all users
userRoutes.get("/", userController.getAllUsers);

// Create a new user
userRoutes.post("/", userController.createUser.bind(userController));

// Get user profile
userRoutes.get("/:id", userController.getUser);

// Update user profile or wallet
userRoutes.put("/:id", userController.updateUser);

export default userRoutes;
