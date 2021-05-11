const ENV = process.env.NODE_ENV;
// If ENV exists, load .env.ENV into process.env, else load .env
require("dotenv").config(ENV ? { path: `.env.${ENV}` } : "");

// Imports
const express = require("express");
const morgan = require("morgan");

// Web server config
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(morgan("tiny"));

// Import Route Handlers
const debugRoutes = require("./routes/debugRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const { isAuthenticated, isAdmin } = require("./middleware/authentication");
const { handleErrors } = require("./middleware/error");

// Enable debug routes on non-prod environments
if (ENV !== "production") {
  app.use("/api/debug", isAuthenticated, isAdmin, debugRoutes);
}

// Add routes
app.use("/api", userRoutes);
app.use("/api", isAuthenticated, courseRoutes);
app.use("/api", isAuthenticated, bookmarkRoutes);
app.use("/api", isAuthenticated, postRoutes);
app.use("/api", isAuthenticated, commentRoutes);

// Custom error handler
app.use(handleErrors);

// Start server
app.listen(PORT, () => {
  console.log(
    `Campfire API running on PORT ${PORT} in ${ENV ? ENV : "development"} mode!`
  );
});
