const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createUser, getUserByEmail } = require("../db/queries/users");

// Register a new user
router.post("/register", (req, res) => {
  // TODO: check user is not logged in
  // const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET_KEY)

  // Check form is valid
  let { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    res.status(400).send();
  }

  // Hash password
  password = bcrypt.hashSync(password, 10);

  // Save the user
  createUser({ firstName, lastName, email, password })
    .then((result) => {
      if (result.length > 0) {
        // Save was successful
        console.log("Saving user, result.id: ", result[0].id);
        const token = jwt.sign(
          { id: result[0].id },
          process.env.JWT_SECRET_KEY
        );
        res.status(200).send({ token, email });
      } else {
        res.status(400).send();
      }
    })
    .catch((err) => res.status(500).send(err));
});

// Log a user in
// If successful, returns a token and user's email
router.post("/login", (req, res) => {
  // Check we have email and password
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send();
  }

  // Find user
  getUserByEmail(email)
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .send({ message: "No user exists with this email" });
      }

      // User exists - check password
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) {
            // Valid login - set JWT and send
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY);
            res.status(200).send({ token, email });
          } else {
            // Invalid password
            res.status(401).send({ message: "Invalid password" });
          }
        })
        .catch((err) => {
          // error occurred with bcrypt compare
          return res.status(500).send(err);
        });
    })
    .catch((err) => {
      // error occurred with query
      return res.status(500).send(err);
    });
});

module.exports = router;
