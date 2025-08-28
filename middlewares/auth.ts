import config from "config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import authService from "../services/auth";

export const auth =
	(role: "User" | "Admin") =>
	(request: Request, response: Response, next: NextFunction) => {
		const accessToken = request.header("X-Access-Token");
		// Access token missing (401 unauthorised)
		if (!accessToken) {
			response.status(401).send({
				status: "MISSING_ACCESS_TOKEN",
				message: "Missing access token",
			});
			return;
		}

		// Check if access token is valid
		const payload = authService.validateToken(accessToken, "accessToken");

		if (!payload) {
			response.status(401).send({
				status: "INVALID_ACCESS_TOKEN",
				message: "Invalid access token",
			});
			return;
		}

		if (payload.role === "User" && role === "Admin") {
			// Insufficient user permissions (403 forbidden)
			response
				.status(403)
				.send({ status: "FORBIDDEN", message: "Access denied" });
			return;
		}

		// Pass userID payload to next controller
		response.locals.user = {
			id: payload.id,
			email: payload.email,
			role: payload.role,
			membershipTier: payload.membershipTier,
		};

		next();
	};

export function validateRefreshToken(refreshToken: string) {
	try {
		const payload = jwt.verify(
			refreshToken,
			config.get("SECRET_KEY") as string
		);
		if (typeof payload !== "string") {
			if (payload.type !== "refreshToken") {
				return false;
			} else {
				return payload;
			}
		}
	} catch (err) {
		return false;
	}
}

export default auth;
