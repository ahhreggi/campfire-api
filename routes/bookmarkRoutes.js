const { isAuthenticated } = require("../middleware/authentication");
const { addBookmark } = require("../db/queries/bookmarks");
const router = require("express").Router();

router.post("/bookmarks", isAuthenticated, (req, res) => {
  const { id } = res.locals.decodedToken;
  const { postId } = req.body;
  addBookmark(id, postId)
    .then((result) => res.send(result))
    .catch((e) => res.status(500).send(e));
});

module.exports = router;
