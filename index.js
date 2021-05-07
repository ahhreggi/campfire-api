// load .env into process.env
require("dotenv").config();

// Imports
const express = require("express");

// Web server config
const PORT = process.env.PORT || 3000;
const app = express();

// Import Route Handlers
const debugRoutes = require("./routes/debugRoutes");

app.use("/api/debug", debugRoutes);

app.listen(PORT, () => {
  console.log("Campfire API running on http://localhost:3000");
});
