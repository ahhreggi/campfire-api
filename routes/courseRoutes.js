const router = require("express").Router();
const uuid = require("uuid");

const {
  getCoursesForUser,
  getCourseById,
  getCourseByAccessCode,
  enrolUserInCourse,
  createCourse,
} = require("../db/queries/courses");
const { isAuthenticated } = require("../middleware/authentication");

// Enrols a user in a course
router.post("/join", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const { accessCode } = req.body;

  if (!accessCode) {
    return res.status(400).send({ message: "Access code is required" });
  }

  getCourseByAccessCode(accessCode).then((result) => {
    if (!result) {
      return res.status(400).send({ message: "Invalid access code" });
    } else if (!result.active) {
      return res
        .status(400)
        .send({ message: "This course is no longer active" });
    } else {
      // User entered valid access code for active course - enrol them
      const role =
        accessCode === result.instructor_access_code ? "instructor" : "student";
      enrolUserInCourse(id, result.id, role)
        .then((result) => {
          res.status(201).send({ redirect_to: `/courses/${result.id}` });
        })
        .catch((err) => res.status(500).send(err));
    }
  });
});

// Creates a new course
router.post("/create", isAuthenticated, (req, res) => {
  const { name, description } = req.body;
  const { id } = res.locals.decodedToken;

  if (!name) {
    return res.status(400).send({ message: "Course name is required" });
  }

  // Generate the access codes
  const courseData = {
    name,
    description,
    studentAccessCode: uuid.v4(),
    instructorAccessCode: uuid.v4(),
  };

  // Insert the new course
  createCourse(courseData)
    // Add the user as the course owner
    .then((newCourse) => enrolUserInCourse(id, newCourse.id, "owner"))
    // Instruct frontend to redirect to new course page
    .then((result) => res.send({ redirect_to: `/courses/${result.course_id}` }))
    .catch((err) => res.status(500).send(err));
});

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
      else
        return Promise.reject(
          "User doesn't have permission to access this course"
        );
    })
    .then((courseData) => res.send(courseData))
    .catch((e) => res.status(401).send({ message: e }));
});

module.exports = router;
