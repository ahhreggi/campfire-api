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

module.exports = router;
