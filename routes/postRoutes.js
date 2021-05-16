const Courses = require("../db/queries/courses");
const Posts = require("../db/queries/posts");
const Comments = require("../db/queries/comments");
const { canEditPost } = require("../helpers/permissionsHelpers");
const router = require("express").Router();
const { roles } = require("../db/queries/users");

// Create a new post
router.post("/posts", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const { courseID, title, body, tags, anonymous } = req.body;

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
    Posts.create({ userID, courseID, title, body, tags, anonymous })
      .then((result) => result.id)
      .then((postID) =>
        Promise.all([Posts.view(postID, userID), Posts.byID(postID, userID)])
      )
      .then(([post, ...extra]) => res.send(post))
      .catch((e) => next(e));
  });
});

// Update a post
router.patch("/posts/:id", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const postID = req.params.id;
  const { title, body, tags, best_answer, anonymous, pinned } = req.body;

  // Check we were given something to edit
  if (
    !title &&
    !body &&
    !tags &&
    !best_answer &&
    best_answer !== null &&
    anonymous === undefined &&
    pinned === undefined
  ) {
    return next({
      status: 400,
      message:
        "Must provide one of: title, body, tags, best_answer, anonymous, pinned",
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
        queries.push(Posts.setTitle(postID, title, userID));
      }

      if (body && body.length > 0) {
        queries.push(Posts.setBody(postID, body, userID));
      }

      if (tags) {
        queries.push(Posts.setTags(postID, tags));
      }

      if (parseInt(best_answer) || best_answer === null) {
        queries.push(
          // Only allow author to select best answer
          Posts.author(postID)
            .then((authorID) => {
              if (authorID !== userID)
                return Promise.reject({
                  status: 401,
                  message: "Only the post author can select a best answer",
                });
              // If given a comment ID -> check comment exists
              if (best_answer !== null) {
                return Comments.getByID(best_answer)
                  .then((comment) => {
                    if (!comment)
                      return Promise.reject({
                        status: 400,
                        message: `Can't make comment ${best_answer} the best answer: it doesn't exist`,
                      });
                    // Check comment was made on this post
                    return Comments.forPost(postID);
                  })
                  .then((comments) => {
                    if (
                      comments.filter((comment) => comment.id === best_answer)
                        .length < 1
                    ) {
                      return Promise.reject({
                        status: 400,
                        message: `Can't make comment ${best_answer} the best answer: it isn't part of this post`,
                      });
                    }
                  });
              }
            })
            // All checks passed - set best answer
            .then(() => Posts.setBestAnswer(postID, best_answer))
        );
      }

      if (anonymous === true || anonymous === false) {
        queries.push(Posts.setAnonymity(postID, anonymous));
      }

      if (pinned === true || pinned === false) {
        // Only allow instructors / owners / admins to pin posts
        queries.push(
          Posts.course(postID).then((courseID) =>
            Courses.role(courseID, userID).then((role) => {
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
    .then(() => Posts.byID(postID, userID))
    .then((result) => res.send(result))
    .catch((err) => next(err));
});

// Delete a post
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

router.post("/posts/:id/view", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const postID = req.params.id;
  // Check user has access to the post
  Posts.course(postID)
    .then((courseID) => Courses.role(courseID, userID))
    .then((role) => {
      if (!role)
        return Promise.reject({
          status: 400,
          message: "User doesn't have access to this course",
        });
      // Increment post views
      return Posts.view(postID, userID);
    })
    .then((result) => res.send())
    .catch((err) => {
      if (err.code === "23505") {
        // If user has already viewed the post, don't send an error.
        return res.send({
          message:
            "User has already viewed this post - not increasing view count",
        });
      }
      next(err);
    });
});

module.exports = router;
