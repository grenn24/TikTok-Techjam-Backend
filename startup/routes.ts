import express, { Express } from "express";

import contentRoutes from "../routes/content";
import error from "../middlewares/error";
import giftRoutes from "../routes/gifts";
import rewardRoutes from "../routes/reward";
import fraudRoutes from "../routes/fraud";
import userRoutes from "../routes/user";
import authRoutes from "../routes/auth";

const routes = (app: Express) => {
	const apiRouter = express.Router();

	apiRouter.use("/auth", authRoutes); // login/register
	apiRouter.use("/users", userRoutes); // user profile, wallet
	apiRouter.use("/content", contentRoutes); // (live videos or feeds)
	apiRouter.use("/gift", giftRoutes); // consumer -> creator gifts
	apiRouter.use("/rewards", rewardRoutes); // creator reward points
	apiRouter.use("/fraud", fraudRoutes); // AML/fraud logs

	// Log errors
	apiRouter.use(error);

	// Handle missed API routes
	apiRouter.use((_, res) => {
		res.status(404).send("API route not found");
	});

	app.use("/api", apiRouter);
};

export default routes;
