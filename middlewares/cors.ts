import { NextFunction, Request, Response } from "express";

// Cors middleware for cross origin requests (backend server hosted independently)
export default function cors(
	request: Request,
	response: Response,
	next: NextFunction
) {
	const allowedOrigins = [
		"http://localhost:5173",
		"http://localhost",
	];
	const origin = request.header("Origin");
	//runtimeDebug(`Origin: ${origin}`);

	if (origin && allowedOrigins.includes(origin)) {
		response.setHeader("Access-Control-Allow-Origin", origin);
	}
	const headers = new Headers({
		"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
		"Access-Control-Allow-Headers":
			"Content-Type, X-Access-Token, Authorization, Accept-Language",
		"Access-Control-Expose-Headers": "X-Access-Token",
		"Access-Control-Allow-Credentials": "true",
		"Access-Control-Max-Age": "1728000",
	});
	response.setHeaders(headers);
	next();
}
