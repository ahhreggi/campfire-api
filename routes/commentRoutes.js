const router = require("express").Router();
const { isAuthenticated } = require("../middleware/authentication");
const { getCourseRoleFromPostId } = require("../db/queries/posts");
const { createComment } = require("../db/queries/comments");

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

module.exports = router;
