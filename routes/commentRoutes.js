const router = require("express").Router();
const Comments = require("../db/queries/comments");

const { canEditComment } = require("../helpers/permissionsHelpers");
const Courses = require("../db/queries/courses");
const Posts = require("../db/queries/posts");

// Create a comment
router.post("/comments", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const { postID, parentID, body, anonymous } = req.body;

  if (!postID || !body) {
    return next({ status: 400, message: "postID, body are required" });
  }

  Posts.course(postID)
    .then((courseID) => Courses.role(courseID, userID))
    .then((role) => {
      if (role === null) {
        return Promise.reject({
          status: 401,
          message: "User doesn't have rights to post a comment here",
        });
      }

      if (parentID) {
        // Check parent comment was made on the same post
        return (
          Comments.forPost(postID)
            .then((comments) => {
              if (
                comments.filter((comment) => comment.id === parentID).length < 1
              ) {
                return Promise.reject({
                  status: 400,
                  message:
                    "The provided parentID is not a comment on the provided postID",
                });
              }
            })
            // Check parent comment is not itself a reply (ie. only allow 1 level of nesting)
            .then(() => Comments.isReply(parentID))
            .then((isReply) => {
              if (isReply)
                return Promise.reject({
                  status: 400,
                  message:
                    "The provided parentID is not a top-level comment (you cannot reply to a reply)",
                });
            })
        );
      }
    })
    .then(() => Comments.create({ postID, parentID, userID, body, anonymous }))
    .then((result) => res.send(result))
    .catch((err) => next(err));
});

// Update a comment
router.patch("/comments/:id", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const { body, anonymous } = req.body;
  const commentID = req.params.id;

  // Check if user has edit permissions on the comment
  canEditComment(userID, commentID)
    .then((editable) => {
      if (!editable) {
        return Promise.reject({
          status: 401,
          message: "User doesn't have permission to edit this comment",
        });
      }

      // User has permission -> make edits
      const queries = [];

      if (body && body.length > 0) {
        queries.push(Comments.setBody(commentID, body, userID));
      }
      if (anonymous === false || anonymous === true) {
        queries.push(Comments.setAnonymity(commentID, anonymous));
      }

      return Promise.all(queries);
    })
    .then(() => Comments.getByID(commentID))
    .then((comment) => res.send(comment))
    .catch((err) => next(err));
});

// Delete a comment
router.delete("/comments/:id", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const commentID = req.params.id;

  // Check if user has edit permissions on the comment
  canEditComment(userID, commentID)
    .then((editable) => {
      if (!editable) {
        return Promise.reject({
          status: 401,
          message: "User doesn't have rights to edit this comment",
        });
      }
      return Comments.remove(commentID);
    })
    .then((result) => res.send(result))
    .catch((err) => next(err));
});

// Like a comment
router.post("/comments/:id/like", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const commentID = req.params.id;

  // Check user has access to course comment is posted in
  Comments.course(commentID)
    .then((courseID) => Courses.role(courseID, userID))
    .then((role) => {
      if (role) return Comments.like(commentID, userID);
      else
        return Promise.reject({
          status: 401,
          message:
            "User doesn't have access to the course this comment is posted in",
        });
    })
    .then((result) => res.send(result))
    .catch((err) => {
      if (err.code === "23505") {
        return next({
          status: 400,
          message: "Comment is already 'liked' by this user",
        });
      }
      next(err);
    });
});

// Unlike a comment
router.post("/comments/:id/unlike", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const commentID = req.params.id;

  Comments.unlike(commentID, userID)
    .then((result) => {
      if (result) return res.send();
      else
        return next({
          status: 400,
          message: "Comment is not 'liked' by this user",
        });
    })
    .catch((err) => next(err));
});

module.exports = router;
