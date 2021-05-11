const { addBookmark, deleteBookmark } = require("../db/queries/bookmarks");
const router = require("express").Router();

router.post("/bookmarks", (req, res) => {
  const { id } = res.locals.decodedToken;
  const { postID } = req.body;
  if (!postID) {
    return res.status(400).send({ message: "postID is required" });
  }
  addBookmark(id, postID)
    .then((result) => res.send())
    .catch((e) => res.status(500).send(e));
});

router.delete("/bookmarks", (req, res) => {
  const { id } = res.locals.decodedToken;
  const { postID } = req.body;
  if (!postID) {
    return res.status(400).send({ message: "postID is required" });
  }
  deleteBookmark(id, postID)
    .then((result) => res.send())
    .catch((e) => res.status(500).send(e));
});

module.exports = router;
