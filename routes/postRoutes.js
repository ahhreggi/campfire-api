const { getCoursesForUser, getCourseRole } = require("../db/queries/courses");
const {
  createPost,
  deletePost,
  setTitle,
  setBody,
  setBestAnswer,
  setAnonymity,
  setPinned,
  getCourseRoleFromPostId,
  getPostersCourseRole,
  getPosterId,
  getPostById,
} = require("../db/queries/posts");
const { editable } = require("../helpers/permissionsHelpers");
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

router.patch("/posts/:id", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const postId = req.params.id;
  const { title, body, best_answer, anonymous, pinned } = req.body;

  // Check if user has edit permissions on the post
  const rolePromise = getCourseRoleFromPostId(postId, id);
  const posterRolePromise = getPostersCourseRole(postId);
  const posterIdPromise = getPosterId(postId);
  Promise.all([rolePromise, posterRolePromise, posterIdPromise])
    .then((result) => {
      const [role, posterRole, posterId] = result;
      if (!editable(role, posterRole, id, posterId)) {
        return Promise.reject("User doesn't have rights to edit this post");
      }

      const queries = [];

      if (title && title.length > 0) {
        queries.push(setTitle(postId, title));
      }

      if (body && body.length > 0) {
        queries.push(setBody(postId, body));
      }

      if (parseInt(best_answer)) {
        queries.push(setBestAnswer(postId, best_answer));
      }

      if (anonymous === true || anonymous === false) {
        queries.push(setAnonymity(postId, anonymous));
      }

      if (pinned === true || pinned === false) {
        queries.push(setPinned(postId, pinned));
      }

      return Promise.all(queries);
    })
    // Send back the updated post
    .then(() => getPostById(postId))
    .then((result) => res.send(result))
    .catch((e) => res.status(400).send({ message: e }));
});

router.delete("/posts/:id", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const postId = req.params.id;
  // Check if user has edit permissions on the post
  const rolePromise = getCourseRoleFromPostId(postId, id);
  const posterRolePromise = getPostersCourseRole(postId);
  const posterIdPromise = getPosterId(postId);
  Promise.all([rolePromise, posterRolePromise, posterIdPromise]).then(
    (result) => {
      const [role, posterRole, posterId] = result;
      if (!editable(role, posterRole, id, posterId)) {
        return Promise.reject("User doesn't have rights to edit this post");
      }

      // Delete the post
      deletePost(postId)
        .then(() => res.send())
        .catch((e) => res.status(500).send({ message: e }));
    }
  );
});

module.exports = router;
