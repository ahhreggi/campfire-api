const db = require("../index");

const addBookmark = function (userId, postId) {
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

const deleteBookmark = function (userId, postId) {
  return db
    .query(
      `
    DELETE FROM bookmarks
    WHERE user_id = $1
    AND post_id = $2
    RETURNING *;
  `,
      [userId, postId]
    )
    .then((res) => res.rows[0]);
};

module.exports = { addBookmark, deleteBookmark };
