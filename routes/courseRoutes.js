const router = require("express").Router();
const jwt = require("jsonwebtoken");

const { getCoursesForUser, getCourseById } = require("../db/queries/courses");
const { isAuthenticated } = require("../middleware/authentication");

router.get("/courses", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  getCoursesForUser(id)
    .then((courses) => res.send(courses))
    .catch((e) => res.status(500).send(e));
});

router.get("/courses/:id", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const courseId = parseInt(req.params.id);
  // Check user is student/instructor/owner of the requested course
  // If so, fetch and return it
  getCoursesForUser(id)
    .then((courses) => courses.map((course) => course.id))
    .then((courseIds) => courseIds.includes(courseId))
    .then((hasAccess) => {
      if (hasAccess) return getCourseById(courseId, id);
    })
    .then((courseData) => res.send(courseData));
});

module.exports = router;
