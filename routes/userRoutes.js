const router = require("express").Router();

const { createNewUser } = require("../db/queries/users");

// Register a new user
router.post("/register", (req, res) => {
  // TODO: check user is not logged in (ie. no cookie)

  // Check form is valid
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    res.status(400).send();
  }

  createNewUser({ firstName, lastName, email, password });
});

module.exports = router;
