import express from "express";
import contentController from "../controllers/content";
import auth from "../middlewares/auth";

const contentRoutes = express.Router();

// Middleware: all content routes require authentication
contentRoutes.use(auth("User"));

// Get all content (optional filters like creator, type)
contentRoutes.get("/", contentController.getAllContent.bind(contentController));

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

// Generate and populate the content quality field
contentRoutes.post(
	"/:id/quality",
	contentController.generateContentQuality.bind(contentController)
);

// Update content (title, description, qualityScore)
contentRoutes.put(
	"/:id",
	contentController.updateContent.bind(contentController)
);

export default contentRoutes;
