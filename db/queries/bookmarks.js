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

module.exports = { addBookmark };
