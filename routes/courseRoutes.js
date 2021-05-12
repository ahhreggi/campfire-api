const router = require("express").Router();
const uuid = require("uuid");

const {
  forUser,
  getCourseById,
  getCourseByAccessCode,
  enrolUserInCourse,
  createCourse,
} = require("../db/queries/courses");

// Enrols a user in a course
router.post("/join", (req, res, next) => {
  const { id } = res.locals.decodedToken;
  const { accessCode } = req.body;

  if (!accessCode) {
    return next({ status: 400, message: "Access code is required" });
  }

  getCourseByAccessCode(accessCode).then((result) => {
    if (!result) {
      return next({ status: 400, message: "Invalid access code" });
    } else if (!result.active) {
      return next({ status: 400, message: "This course is no longer active" });
    } else {
      // User entered valid access code for active course - enrol them
      const role =
        accessCode === result.instructor_access_code ? "instructor" : "student";
      enrolUserInCourse(id, result.id, role)
        .then((result) => {
          res.status(201).send({ redirect_to: `/courses/${result.id}` });
        })
        .catch((err) => next(err));
    }
  });
});

// Creates a new course
router.post("/create", (req, res, next) => {
  const { name, description } = req.body;
  const { id } = res.locals.decodedToken;

  if (!name) return next({ status: 400, message: "Course name is required" });

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
    .catch((err) => next(err));
});

router.get("/courses", (req, res, next) => {
  const { id } = res.locals.decodedToken;
  forUser(id)
    .then((courses) => res.send(courses))
    .catch((err) => next(err));
});

router.get("/courses/:id", (req, res, next) => {
  const { id } = res.locals.decodedToken;
  const courseId = parseInt(req.params.id);
  // Check user is student/instructor/owner of the requested course
  // If so, fetch and return it
  forUser(id)
    .then((courses) => courses.map((course) => course.id))
    .then((courseIds) => courseIds.includes(courseId))
    .then((hasAccess) => {
      if (hasAccess) return getCourseById(courseId, id);
      else
        return Promise.reject({
          status: 401,
          message: "User doesn't have permission to access this course",
        });
    })
    .then((courseData) => res.send(courseData))
    .catch((err) => next(err));
});

module.exports = router;
