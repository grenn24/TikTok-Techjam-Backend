import jwt from "jsonwebtoken";
import config from "config";

const auth =
	(role: "User" | "Admin") => (request: any, response: any, next: any) => {
		const accessToken = request.header("X-Access-Token");
		try {
			// Access token missing
			if (!accessToken) {
				return response.status(401).send({
					status: "MISSING_ACCESS_TOKEN",
					message: "Missing access token",
				});
			}
			const payload = jwt.verify(accessToken, config.get("SECRET_KEY"));
			if (
				typeof payload !== "string" &&
				payload.role === "User" &&
				role === "Admin"
			) {
				// Insufficient user permissions
				return response
					.status(403)
					.send({ status: "FORBIDDEN", message: "Access denied" });
			}
			// Pass userID payload to next controller
			if (typeof payload != "string") {
				response.locals.user = {
					userID: payload?.userID,
					role: payload?.role,
				};
			}
			next();
		} catch (err) {
			// Access token invalid
			response.status(401).send({
				status: "INVALID_ACCESS_TOKEN",
				message: "Invalid access token",
			});
		}
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
