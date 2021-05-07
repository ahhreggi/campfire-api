// load .env into process.env
require("dotenv").config();

// Imports
const express = require("express");

// Web server config
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

// Import Route Handlers
const debugRoutes = require("./routes/debugRoutes");
const userRoutes = require("./routes/userRoutes");
//const userCourseRoutes = require("./routes/userCourseRoutes");

app.use("/api/debug", debugRoutes);
app.use("/api", userRoutes);
//app.use("/api", userCourseRoutes);

app.listen(PORT, () => {
  console.log("Campfire API running on http://localhost:3000");
});
