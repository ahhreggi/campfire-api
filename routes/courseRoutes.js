const router = require("express").Router();
const uuid = require("uuid");
const Courses = require("../db/queries/courses");

// Enrols a user in a course
router.post("/join", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const { accessCode } = req.body;

  if (!accessCode) {
    return next({ status: 400, message: "Access code is required" });
  }

  Courses.byAccessCode(accessCode).then((result) => {
    if (!result) {
      return next({ status: 400, message: "Invalid access code" });
    } else if (!result.active) {
      return next({ status: 400, message: "This course is no longer active" });
    } else {
      // User entered valid access code for active course - enrol them
      const role =
        accessCode === result.instructor_access_code ? "instructor" : "student";
      Courses.enrol(userID, result.id, role)
        .then((result) => Courses.byID(result.course_id, userID))
        .then((course) => res.send(course))
        .catch((err) => {
          if (err.code === "23505") {
            return next({
              status: 400,
              message: "User is already enrolled in this course",
            });
          }
          return next(err);
        });
    }
  });
});

// Creates a new course
router.post("/create", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const { name, description } = req.body;

  if (!name) return next({ status: 400, message: "Course name is required" });

  // Generate the access codes
  const courseData = {
    name,
    description,
    studentAccessCode: uuid.v4(),
    instructorAccessCode: uuid.v4(),
  };

  // Insert the new course
  Courses.create(courseData)
    // Add the user as the course owner
    .then((newCourse) => Courses.enrol(userID, newCourse.id, "owner"))
    // Instruct frontend to redirect to new course page
    .then((result) => Courses.byID(result.course_id, userID))
    .then((course) => res.send(course))
    .catch((err) => next(err));
});

router.get("/courses", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  Courses.forUser(userID)
    .then((courses) => res.send(courses))
    .catch((err) => next(err));
});

router.get("/courses/:id", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const courseID = parseInt(req.params.id);

  Courses.forUser(userID)
    .then((courses) => courses.map((course) => course.id))
    .then((courseIDs) => courseIDs.includes(courseID))
    .then((hasAccess) => {
      if (hasAccess) return Courses.byID(courseID, userID);
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
