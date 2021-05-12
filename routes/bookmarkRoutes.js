const Bookmarks = require("../db/queries/bookmarks");
const router = require("express").Router();

router.post("/bookmarks", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const { postID } = req.body;
  if (!postID) {
    return next({ status: 400, message: "postID is required" });
  }
  Bookmarks.create(userID, postID)
    .then((result) => res.send())
    .catch((err) => next(err));
});

router.delete("/bookmarks", (req, res, next) => {
  const { id: userID } = res.locals.decodedToken;
  const { postID } = req.body;
  if (!postID) {
    return next({ status: 400, message: "postID is required" });
  }
  Bookmarks.remove(userID, postID)
    .then((result) => res.send())
    .catch((err) => next(err));
});

module.exports = router;
