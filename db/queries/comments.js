const db = require("../index");

const createComment = function (commentData) {
  const {
    postId,
    parentId = null,
    userId,
    body,
    anonymous = false,
  } = commentData;
  return db
    .query(
      `
    INSERT INTO comments (post_id, parent_id, user_id, body, anonymous)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `,
      [postId, parentId, userId, body, anonymous]
    )
    .then((res) => res.rows[0]);
};

module.exports = { createComment };
