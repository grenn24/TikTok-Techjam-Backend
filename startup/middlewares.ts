import config from "config";
import cookieParser from "cookie-parser";
import express, { Express } from "express";
import morgan from "morgan";
import cors from "../middlewares/cors";

const middlewares = (app: Express) => {
	// middlewares
	config.get("NODE_ENV") === "development" && app.use(cors);
	app.use(cookieParser());
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	if (app.get("env") === "development") {
		app.use(morgan("tiny"));
	}
};

export default middlewares;
