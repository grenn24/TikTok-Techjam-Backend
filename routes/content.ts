import express from "express";
import contentController from "../controllers/content";
import auth from "../middlewares/auth";

const contentRoutes = express.Router();

// Middleware: all content routes require authentication
contentRoutes.use(auth("User"));

// Get all content (optional filters like creator, type)
contentRoutes.get("/", contentController.getContentByUser.bind(contentController));

// Upload new content (video or live)
contentRoutes.post(
	"/",
	contentController.uploadContent.bind(contentController)
);

// Get specific content by ID
contentRoutes.get(
	"/:id",
	contentController.getContentById.bind(contentController)
);

// Generate engagement score
contentRoutes.post(
	"/:id/engagement-score",
	contentController.generateEngagementScore.bind(contentController)
);

// Generate quality score
contentRoutes.post(
	"/:id/quality-score",
	contentController.generateQualityScore.bind(contentController)
);

// Update content (title, description, qualityScore)
contentRoutes.put(
	"/:id",
	contentController.updateContent.bind(contentController)
);

export default contentRoutes;
