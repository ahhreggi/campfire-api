const { getCoursesForUser } = require("../db/queries/courses");
const { createPost } = require("../db/queries/posts");
const { isAuthenticated } = require("../middleware/authentication");
const router = require("express").Router();

router.post("/posts", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const { courseId, title, body, anonymous } = req.body;

  // Check fields
  if (!courseId || !title || !body) {
    return res
      .status(400)
      .send({ message: "courseId, title, body are required" });
  }

  getCoursesForUser(id).then((courses) => {
    // Check user has permission to create post in the course
    if (courses.filter((course) => course.id === courseId).length < 1) {
      return res
        .status(401)
        .send({ message: "User doesn't have access to this course" });
    }
    // User does have permission - create post
    createPost({ id, courseId, title, body, anonymous })
      .then((result) => res.send(result))
      .catch((e) => res.status(500).send(e));
  });
});

router.patch("/posts/:id", isAuthenticated, (req, res) => {});

module.exports = router;
