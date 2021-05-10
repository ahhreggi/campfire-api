const router = require("express").Router();

const { resetDb } = require("../db/queries/debug");

router.get("/reset_db", (req, res) => {
  resetDb();
  console.log("DB reset initiated");
  res.end();
});

module.exports = router;
