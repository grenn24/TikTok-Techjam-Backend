import config from "config";
import jwt from "jsonwebtoken";

class AuthService {
	validateToken(
		token: string,
		type: "refreshToken" | "resetPasswordToken" | "accessToken"
	): false | jwt.JwtPayload {
		if (!token) {
			return false;
		}
		try {
			const payload = jwt.verify(
				token,
				config.get("SECRET_KEY") as string
			);
			if (typeof payload !== "object" || payload.type !== type) {
				return false;
			}
			return payload;
		} catch (err) {
			if (
				err instanceof jwt.TokenExpiredError ||
				err instanceof jwt.JsonWebTokenError ||
				err instanceof jwt.NotBeforeError
			) {
				return false;
			}
			throw err;
		}
	}
}

const authService = new AuthService();
export default authService;
