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
const courseRoutes = require("./routes/courseRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");

app.use("/api/debug", debugRoutes);
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", bookmarkRoutes);

app.listen(PORT, () => {
  console.log(`Campfire API running on PORT ${PORT}!`);
});
