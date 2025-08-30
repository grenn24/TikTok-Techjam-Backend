import express, { Express } from "express";
import auditRoutes from "routes/audit";
import error from "../middlewares/error";
import authRoutes from "../routes/auth";
import contentRoutes from "../routes/content";
import giftRoutes from "../routes/gifts";
import rewardRoutes from "../routes/reward";
import userRoutes from "../routes/user";

const routes = (app: Express) => {
	const apiRouter = express.Router();
	apiRouter.use("/auth", authRoutes); // login/register
	apiRouter.use("/user", userRoutes); // user profile, wallet
	apiRouter.use("/content", contentRoutes); // (live videos or feeds)
	apiRouter.use("/gift", giftRoutes); // consumer -> creator gifts
	apiRouter.use("/reward", rewardRoutes); // creator reward points
	apiRouter.use("/audit", auditRoutes); // Audit Logs

	// Log errors
	apiRouter.use(error);

	// Handle missed API routes
	apiRouter.use((_, res) => {
		res.status(404).send("This API route does not exist");
	});

	app.use("/api", apiRouter);
};

export default routes;
