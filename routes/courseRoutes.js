const router = require("express").Router();
const jwt = require("jsonwebtoken");

const { getCoursesForUser } = require("../db/queries/courses");
const { isAuthenticated } = require("../middleware/authentication");

router.get("/courses", isAuthenticated, (req, res) => {
  const userId = res.locals.decodedToken.id;
  getCoursesForUser(userId)
    .then((courses) => res.send(courses))
    .catch((e) => res.status(500).send(e));
});

module.exports = router;
