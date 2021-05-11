const { addBookmark, deleteBookmark } = require("../db/queries/bookmarks");
const router = require("express").Router();

router.post("/bookmarks", (req, res) => {
  const { id } = res.locals.decodedToken;
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).send({ message: "postId is required" });
  }
  addBookmark(id, postId)
    .then((result) => res.send())
    .catch((e) => res.status(500).send(e));
});

router.delete("/bookmarks", (req, res) => {
  const { id } = res.locals.decodedToken;
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).send({ message: "postId is required" });
  }
  deleteBookmark(id, postId)
    .then((result) => res.send())
    .catch((e) => res.status(500).send(e));
});

module.exports = router;
