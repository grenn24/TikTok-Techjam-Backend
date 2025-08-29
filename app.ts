import "dotenv/config";
import config from "config";
import createDebug from "debug";
import express from "express";
import startupConfig from "./startup/config";
import logging from "./startup/logging";
import middlewares from "./startup/middlewares";
import routes from "./startup/routes";

const startupDebug = createDebug("app:startup");
const app = express();

logging();
startupConfig();
middlewares(app);
routes(app);

// Start the server
app.on("connection", () => {});
app.on("error", (err) => {
	console.error(`Server error: ${err}`);
});
const port = config.get("PORT") || 3000;
app.listen(port, () => {
	startupDebug(`Server running at http://localhost:${port}`);
});
