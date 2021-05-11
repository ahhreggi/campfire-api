ENV = process.env.NODE_ENV;
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

// Enable debug routes on non-prod environments
if (ENV !== "production") {
  app.use("/api/debug", debugRoutes);
}

app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", bookmarkRoutes);
app.use("/api", postRoutes);
app.use("/api", commentRoutes);

app.listen(PORT, () => {
  console.log(
    `Campfire API running on PORT ${PORT} in ${ENV ? ENV : "development"} mode!`
  );
});
