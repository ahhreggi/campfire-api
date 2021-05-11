const { addBookmark, deleteBookmark } = require("../db/queries/bookmarks");
const router = require("express").Router();

router.post("/bookmarks", (req, res, next) => {
  const { id } = res.locals.decodedToken;
  const { postID } = req.body;
  if (!postID) {
    return next({ status: 400, message: "postID is required" });
  }
  addBookmark(id, postID)
    .then((result) => res.send())
    .catch((err) => next(err));
});

router.delete("/bookmarks", (req, res, next) => {
  const { id } = res.locals.decodedToken;
  const { postID } = req.body;
  if (!postID) {
    return next({ status: 400, message: "postID is required" });
  }
  deleteBookmark(id, postID)
    .then((result) => res.send())
    .catch((err) => next(err));
});

module.exports = router;
