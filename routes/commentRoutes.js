const router = require("express").Router();
const { isAuthenticated } = require("../middleware/authentication");
const { getCourseRoleFromPostId } = require("../db/queries/posts");
const {
  createComment,
  getCourseRoleFromCommentId,
  getCommentorsCourseRole,
  getCommentorId,
  setBody,
  setAnonymity,
  getCommentById,
  deleteComment,
  likeComment,
  unlikeComment,
} = require("../db/queries/comments");

const { editable } = require("../helpers/permissionsHelpers");

router.post("/comments", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const { postId, parentId, body, anonymous } = req.body;
  getCourseRoleFromPostId(postId, id).then((role) => {
    if (role === null) {
      return res
        .status(401)
        .send({ message: "User doesn't have rights to post a comment here" });
    }

    createComment({ postId, parentId, userId: id, body, anonymous })
      .then((result) => res.send(result))
      .catch((e) => res.status(500).send(e));
  });
});

router.patch("/comments/:id", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const { body, anonymous } = req.body;
  const commentId = req.params.id;

  // Check if user has edit permissions on the comment
  const rolePromise = getCourseRoleFromCommentId(commentId, id);
  const commentorRolePromise = getCommentorsCourseRole(commentId);
  const commentorIdPromise = getCommentorId(commentId);
  Promise.all([rolePromise, commentorRolePromise, commentorIdPromise])
    .then((result) => {
      const [role, commentorRole, commentorId] = result;
      if (!editable(role, commentorRole, id, commentorId)) {
        return Promise.reject("User doesn't have rights to edit this comment");
      }

      const queries = [];

      if (body && body.length > 0) {
        queries.push(setBody(commentId, body));
      }

      if (anonymous === false || anonymous === true) {
        queries.push(setAnonymity(commentId, anonymous));
      }

      return Promise.all(queries);
    })
    .then(() => getCommentById(commentId))
    .then((comment) => res.send(comment))
    .catch((e) => res.status(400).send({ message: e }));
});

router.delete("/comments/:id", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const commentId = req.params.id;

  // Check if user has edit permissions on the comment
  const rolePromise = getCourseRoleFromCommentId(commentId, id);
  const commentorRolePromise = getCommentorsCourseRole(commentId);
  const commentorIdPromise = getCommentorId(commentId);
  Promise.all([rolePromise, commentorRolePromise, commentorIdPromise])
    .then((result) => {
      const [role, commentorRole, commentorId] = result;
      if (!editable(role, commentorRole, id, commentorId)) {
        return Promise.reject("User doesn't have rights to edit this comment");
      }
      deleteComment(commentId).then(() => res.send());
    })
    .catch((e) => res.status(400).send({ message: e }));
});

router.post("/comments/:id/like", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const commentId = req.params.id;

  // Check user has access to course comment is posted in
  getCourseRoleFromCommentId(commentId, id)
    .then((role) => {
      if (role) return likeComment(commentId, id);
      else
        return Promise.reject(
          "User doesn't have access to the course this comment is posted in"
        );
    })
    .then((result) => res.send())
    .catch((e) => res.status(500).send({ message: e }));
});

router.post("/comments/:id/unlike", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const commentId = req.params.id;

  unlikeComment(commentId, id)
    .then((result) => res.send())
    .catch((e) => res.status(500).send({ message: e }));
});

module.exports = router;
