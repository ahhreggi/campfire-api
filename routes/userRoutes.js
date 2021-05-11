const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createUser, getUserByEmail } = require("../db/queries/users");

// Register a new user
router.post("/register", (req, res, next) => {
  // Check form is valid
  let { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return next({
      status: 400,
      message: "firstName, lastName, email, and password are required",
    });
  }

  // Hash password
  password = bcrypt.hashSync(password, 10);

  // Generate random avatar id
  const avatarId = Math.floor(Math.random() * 22) + 2;

  // Save the user
  createUser({ firstName, lastName, email, password, avatarId })
    .then((result) => {
      if (result.length > 0) {
        // Save was successful
        const firstName = result[0].first_name;
        const lastName = result[0].last_name;
        const avatarID = result[0].avatar_id;
        const token = jwt.sign(
          { id: result[0].id },
          process.env.JWT_SECRET_KEY
        );
        res.status(200).send({ token, email, firstName, lastName, avatarID });
      } else {
        next({
          status: 500,
          message: "Unknown error occured - failed to create user",
        });
      }
    })
    .catch((err) => next(err));
});

// Log a user in
// If successful, returns a token and user's email
router.post("/login", (req, res, next) => {
  // Check we have email and password
  const { email, password } = req.body;
  if (!email || !password) {
    return next({ status: 400, message: "email, password are required" });
  }

  // Find user
  getUserByEmail(email)
    .then((user) => {
      if (!user) {
        return next({ status: 400, message: "No user exists with this email" });
      }

      // User exists - check password
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) {
            // Valid login - set JWT and send
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY);
            const firstName = user.first_name;
            const lastName = user.last_name;
            const avatarID = user.avatar_id;
            res
              .status(200)
              .send({ token, email, firstName, lastName, avatarID });
          } else {
            // Invalid password
            next({ status: 401, message: "Invalid password" });
          }
        })
        .catch((err) =>
          // error occurred with bcrypt compare
          next(err)
        );
    })
    .catch((err) => {
      // error occurred with query
      next(err);
    });
});

module.exports = router;
