const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../db/queries/users");
const { isAuthenticated } = require("../middleware/authentication");

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
        const token = jwt.sign(
          { id: result[0].id },
          process.env.JWT_SECRET_KEY
        );
        const userID = result[0].id;
        const email = result[0].email;
        const firstName = result[0].first_name;
        const lastName = result[0].last_name;
        const avatarID = result[0].avatar_id;
        const joinDate = result[0].created_at;
        res.status(200).send({
          token,
          userID,
          email,
          firstName,
          lastName,
          avatarID,
          joinDate,
        });
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
        const joinDate = user.created_at;
        res.status(200).send({
          token,
          userID,
          email,
          firstName,
          lastName,
          avatarID,
          joinDate,
        });
      } else {
        // Invalid password
        next({ status: 401, message: "Invalid password" });
      }
    })
    .catch((err) => next(err));
});

// Update a user's details
router.patch("/user", isAuthenticated, (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const { firstName, lastName, email, password, avatarID } = req.body;

  if (!firstName && !lastName && !email && !password && !avatarID) {
    return next({
      status: 400,
      message:
        "Must provide one of: firstName, lastName, email, password, avatarID",
    });
  }

  const queries = [];

  if (firstName) {
    queries.push(Users.setFirstName(userID, firstName));
  }

  if (lastName) {
    queries.push(Users.setLastName(userID, lastName));
  }

  if (email) {
    queries.push(Users.setEmail(userID, email));
  }

  if (password) {
    queries.push(
      bcrypt.hash(password, 10).then((hash) => Users.setPassword(userID, hash))
    );
  }

  if (avatarID) {
    if (avatarID < 2 || avatarID > 23) {
      queries.push(
        Promise.reject({
          status: 400,
          message: "avatarID must be between 2 and 23 (inclusive)",
        })
      );
    } else {
      queries.push(Users.setAvatar(userID, avatarID));
    }
  }

  return Promise.all(queries)
    .then(() => Users.byID(userID))
    .then((user) =>
      res.send({
        userID: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarID: user.avatar_id,
      })
    )
    .catch((err) => next(err));
});

module.exports = router;
