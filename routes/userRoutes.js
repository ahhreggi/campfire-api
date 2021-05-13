const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../db/queries/users");

// Register a new user
router.post("/register", (req, res, next) => {
  // Check form is valid
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return next({
      status: 400,
      message: "firstName, lastName, email, and password are required",
    });
  }

  // Generate random avatar id
  const avatarID = Math.floor(Math.random() * 22) + 2;

  // Hash password
  bcrypt
    .hash(password, 10)
    // Save the user
    .then((hash) => {
      return Users.create({ firstName, lastName, email, hash, avatarID });
    })
    .then((result) => {
      if (result.length > 0) {
        // Save was successful
        const userID = result[0].id;
        const email = result[0].email;
        const firstName = result[0].first_name;
        const lastName = result[0].last_name;
        const avatarID = result[0].avatar_id;
        const token = jwt.sign(
          { id: result[0].id },
          process.env.JWT_SECRET_KEY
        );
        res
          .status(200)
          .send({ token, userID, email, firstName, lastName, avatarID });
      } else {
        next({
          status: 500,
          message: "Unknown error occured - failed to create user",
        });
      }
    })
    .catch((err) => {
      if (err.code === "23505") {
        return next({
          status: 400,
          message: "User with this email already exists",
        });
      }
      next(err);
    });
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
  Users.byEmail(email)
    .then((user) => {
      if (!user) {
        return Promise.reject({
          status: 400,
          message: "No user exists with this email",
        });
      }
      // User exists - check password
      return Promise.all([
        bcrypt.compare(password, user.password),
        Promise.resolve(user),
      ]);
    })
    .then(([match, user]) => {
      if (match) {
        // Valid login - set JWT and send
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY);
        const userID = user.id;
        const firstName = user.first_name;
        const lastName = user.last_name;
        const avatarID = user.avatar_id;
        res
          .status(200)
          .send({ token, userID, email, firstName, lastName, avatarID });
      } else {
        // Invalid password
        next({ status: 401, message: "Invalid password" });
      }
    })
    .catch((err) => next(err));
});

module.exports = router;
