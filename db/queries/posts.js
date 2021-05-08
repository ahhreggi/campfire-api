const db = require("../index");

const createPost = function (post) {
  const { userId, courseId, title, body, anonymous = false } = post;
  return db
    .query(
      `
    INSERT INTO posts (user_id, course_id, title, body, anonymous)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `,
      [userId, courseId, title, body, anonymous]
    )
    .then((res) => res.rows[0]);
};

module.exports = { createPost };
