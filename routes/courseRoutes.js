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

  Courses.byAccessCode(accessCode).then((courseByAccessCode) => {
    if (!courseByAccessCode) {
      return next({ status: 400, message: "Invalid access code" });
    } else if (!courseByAccessCode.active) {
      return next({ status: 400, message: "This course is no longer active" });
    } else {
      // User entered valid access code for active course - enrol them
      const role =
        accessCode === courseByAccessCode.instructor_access_code
          ? "instructor"
          : "student";
      Courses.enrol(userID, courseByAccessCode.id, role)
        .then((result) => Courses.byID(result.course_id, userID))
        .then((course) => res.send(course))
        .catch((err) => {
          if (err.code === "23505") {
            // User is already enrolled - just return course data
            return Courses.byID(courseByAccessCode.id, userID).then((course) =>
              res.send(course)
            );
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

// Update course data (name, description, tags, archived, user roles).
router.patch("/courses/:id", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const courseID = req.params.id;
  const { name, description, tags, archive, roles } = req.body;

  // Get course role
  return Courses.role(courseID, userID)
    .then((role) => {
      if (!role || role === "student") {
        return Promise.reject({
          status: 401,
          message:
            "Only instructors, owners, or admins of the course can edit course data",
        });
      }

      const queries = [];

      if (tags) {
        queries.push(Courses.updateTags(courseID, tags));
      }

      if (name) {
        if (role === "instructor")
          return Promise.reject({
            status: 401,
            message: "Instructors cannot edit course names",
          });

        queries.push(Courses.updateName(courseID, name));
      }

      if (description) {
        if (role === "instructor")
          return Promise.reject({
            status: 401,
            message: "Instructors cannot edit course descriptions",
          });

        queries.push(Courses.updateDescription(courseID, description));
      }

      if (archive === true || archive === false) {
        if (role === "instructor")
          return Promise.reject({
            status: 401,
            message: "Instructors cannot archive courses",
          });

        queries.push(Courses.archive(courseID, archive));
      }

      if (roles) {
        if (role === "instructor")
          return Promise.reject({
            status: 401,
            message: "Instructors cannot edit course roles",
          });

        // Check all roles provided are valid
        for (role in roles) {
          console.log("role", role);
          if (
            roles[role] !== null &&
            roles[role] !== "student" &&
            roles[role] !== "instructor" &&
            roles[role] !== "owner"
          ) {
            return Promise.reject({
              status: 400,
              message: "Can only set roles: student, instructor, owner",
            });
          }
        }

        // Update the roles
        for (role in roles) {
          queries.push(
            Courses.updateRole(courseID, parseInt(role), roles[role])
          );
        }
      }

      return Promise.all(queries);
    })
    .then(() => Courses.byID(courseID, userID))
    .then((result) => res.send(result))
    .catch((err) => next(err));
});

router.post("/courses/:id/resetAccessCodes", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const courseID = req.params.id;

  Courses.role(courseID, userID)
    .then((role) => {
      if (role !== "owner") {
        return Promise.reject({
          status: 401,
          message: "Only course owners can reset access codes",
        });
      }

      const instructorAccessCode = uuid.v4();
      const studentAccessCode = uuid.v4();

      return Courses.setAccessCodes(
        courseID,
        studentAccessCode,
        instructorAccessCode
      );
    })
    .then(() => Courses.byID(courseID))
    .then((result) => res.send(result))
    .catch((err) => next(err));
});

module.exports = router;
