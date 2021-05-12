const Courses = require("../db/queries/courses");
const Posts = require("../db/queries/posts");
const { canEditPost } = require("../helpers/permissionsHelpers");
const router = require("express").Router();
const { roles } = require("../db/queries/users");

router.post("/posts", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const { courseID, title, body, anonymous } = req.body;

  // Check fields
  if (!courseID || !title || !body) {
    return next({ status: 400, message: "courseID, title, body are required" });
  }

  Courses.forUser(userID).then((courses) => {
    // Check user has permission to create post in the course
    if (courses.filter((course) => course.id === courseID).length < 1) {
      return next({
        status: 401,
        message: "User doesn't have access to this course",
      });
    }
    // User does have permission - create post
    Posts.create({ userID, courseID, title, body, anonymous })
      .then((result) => res.send(result))
      .catch((e) => next(e));
  });
});

router.patch("/posts/:id", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const postID = req.params.id;
  const { title, body, best_answer, anonymous, pinned } = req.body;

  // Check we were given something to edit
  if (
    !title &&
    !body &&
    !best_answer &&
    anonymous === undefined &&
    pinned === undefined
  ) {
    return next({
      status: 400,
      message:
        "Must provide one of: title, body, best_answer, anonymous, pinned",
    });
  }
  // Check if user has edit permissions on the post
  canEditPost(userID, postID)
    .then((editable) => {
      if (!editable) {
        return Promise.reject({
          status: 401,
          message: "User doesn't have rights to edit this post",
        });
      }

      const queries = [];

      if (title && title.length > 0) {
        queries.push(Posts.setTitle(postID, title));
      }

      if (body && body.length > 0) {
        queries.push(Posts.setBody(postID, body));
      }

      if (parseInt(best_answer)) {
        queries.push(Posts.setBestAnswer(postID, best_answer));
      }

      if (anonymous === true || anonymous === false) {
        queries.push(Posts.setAnonymity(postID, anonymous));
      }

      if (pinned === true || pinned === false) {
        console.log("here");
        // Only allow instructors / owners / admins to pin posts
        queries.push(
          Posts.course(postID).then((courseID) =>
            Courses.role(courseID, userID).then((role) => {
              console.log("role", role);
              if (
                role === roles.INSTRUCTOR ||
                role === roles.OWNER ||
                role === roles.ADMIN
              ) {
                return Posts.setPinned(postID, pinned);
              } else {
                return Promise.reject({
                  status: 401,
                  message: "Only instructors or above can pin courses",
                });
              }
            })
          )
        );
      }
      return Promise.all(queries);
    })
    // Send back the updated post
    .then(() => Posts.getByID(postID))
    .then((result) => res.send(result))
    .catch((err) => next(err));
});

router.delete("/posts/:id", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const postID = req.params.id;
  // Check if user has edit permissions on the post
  canEditPost(userID, postID)
    .then((editable) => {
      if (!editable) {
        return Promise.reject({
          status: 401,
          message: "User doesn't have rights to edit this post",
        });
      }
      // Delete the post
      return Posts.remove(postID);
    })
    .then((result) => res.send(result))
    .catch((err) => next(err));
});

module.exports = router;
