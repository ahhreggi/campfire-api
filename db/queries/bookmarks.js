const db = require("../index");

const create = function (userId, postId) {
  return db
    .query(
      `
    INSERT INTO bookmarks (user_id, post_id)
    VALUES ($1, $2)
    RETURNING *;
  `,
      [userId, postId]
    )
    .then((res) => res.rows[0]);
};

const remove = function (userID, postID) {
  return db
    .query(
      `
    DELETE FROM bookmarks
    WHERE user_id = $1
    AND post_id = $2
    RETURNING *;
  `,
      [userID, postID]
    )
    .then((res) => res.rows[0]);
};

module.exports = { create, remove };
