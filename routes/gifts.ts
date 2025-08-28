import express from "express";
import giftController from "../controllers/gift";
import auth from "../middlewares/auth";

const giftRoutes = express.Router();

// Middleware: all gift routes require authentication
giftRoutes.use(auth("User"));

// Send a gift (consumer -> creator)
giftRoutes.post("/", giftController.sendGift.bind(giftController));

// List gifts sent by a user
giftRoutes.get(
	"/sent/:userId",
	giftController.listSentGifts.bind(giftController)
);

// List gifts received by a creator
giftRoutes.get(
	"/received/:userId",
	giftController.listReceivedGifts.bind(giftController)
);

export default giftRoutes;
