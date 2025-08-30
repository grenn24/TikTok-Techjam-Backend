import { PrismaClient } from "@prisma/client";
import config from "config";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "node_modules/bcryptjs";

class AuthController {
	prisma = new PrismaClient();
	// ----------------- SIGN UP -----------------
	async signup(req: Request, res: Response) {
		const { name, email, password, role } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		try {
			// Check if user already exists
			const existingUser = await this.prisma.user.findUnique({
				where: { email },
			});
			if (existingUser) {
				return res
					.status(400)
					.json({ message: "Email already registered" });
			}

			// Hash password
			const hashedPassword = await bcrypt.hash(password, 10);

			// Create user
			const user = await this.prisma.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
					role: role || "CONSUMER",
				},
			});

			// Generate JWT token
			const token = jwt.sign(
				{
					id: user.id,
					role: user.role,
					email: user.email,
					type: "accessToken",
				},
				config.get("SECRET_KEY") as string,
				{
					expiresIn: "7d",
				}
			);

			res.cookie("X-Access-Token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production", // true in prod
				sameSite: "lax",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			res.header("X-Access-Token", token);

			// Return user info (optional) without token in JSON
			return res.status(201).json(user);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: "Internal server error" });
		}
	}

	// ----------------- LOGIN -----------------
	async login(req: Request, res: Response) {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Missing email or password" });
		}

		try {
			const user = await this.prisma.user.findUnique({
				where: { email },
			});
			if (!user)
				return res.status(401).json({ message: "Invalid credentials" });

			// Compare passwords
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch)
				return res.status(401).json({ message: "Invalid credentials" });

			// Generate JWT token
			const token = jwt.sign(
				{
					id: user.id,
					role: user.role,
					email: user.email,
					type: "accessToken",
				},
				config.get("SECRET_KEY") as string,
				{
					expiresIn: "7d",
				}
			);

			res.cookie("X-Access-Token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production", // true in prod
				sameSite: "lax",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			res.header("X-Access-Token", token);

			return res.status(200).json(user);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ message: "Internal server error" });
		}
	}
}

const authController = new AuthController();

export default authController;
