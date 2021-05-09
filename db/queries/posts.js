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

const deletePost = function (postId) {
  return db
    .query(
      `
    UPDATE posts
    SET active = false
    WHERE id = $1
    RETURNING *;
  `,
      [postId]
    )
    .then((res) => res.rows[0]);
};

const getPostById = function (postId) {
  return db
    .query(
      `
    SELECT *
    FROM posts
    WHERE id = $1;  
`,
      [postId]
    )
    .then((res) => res.rows[0]);
};

const getCourseRoleFromPostId = function (postId, userId) {
  return db
    .query(
      `
    SELECT course_id 
    FROM posts
    WHERE id = $1;
  `,
      [postId]
    )
    .then((res) => res.rows[0].course_id)
    .then((courseId) =>
      db.query(
        `
      SELECT 
      CASE 
        WHEN (SELECT is_admin FROM users WHERE id = $1) = TRUE THEN 'admin'
        ELSE (SELECT role FROM enrolments WHERE user_id = $1 AND course_id = $2) 
      END AS role
  `,
        [userId, courseId]
      )
    )
    .then((res) => res.rows[0].role);
};

const getPostersCourseRole = function (postId) {
  return db
    .query(
      `
    SELECT user_id, course_id
    FROM posts
    WHERE id = $1;
  `,
      [postId]
    )
    .then((res) =>
      db.query(
        `
    SELECT 
    CASE 
      WHEN (SELECT is_admin FROM users WHERE id = $1) = TRUE THEN 'admin'
      ELSE (SELECT role FROM enrolments WHERE user_id = $1 AND course_id = $2) 
    END AS role
  `,
        [res.rows[0].user_id, res.rows[0].course_id]
      )
    )
    .then((res) => res.rows[0].role);
};

const getPosterId = function (postId) {
  return db
    .query(
      `
    SELECT user_id
    FROM posts
    WHERE id = $1;
  `,
      [postId]
    )
    .then((res) => res.rows[0].user_id);
};

const setTitle = function (postId, title) {
  return db
    .query(
      `
    UPDATE posts
    SET title = $2, last_modified = now()
    WHERE id = $1
    RETURNING *;
  `,
      [postId, title]
    )
    .then((res) => res.rows[0]);
};

const setBody = function (postId, body) {
  return db
    .query(
      `
    UPDATE posts
    SET body = $2, last_modified = now()
    WHERE id = $1
    RETURNING *;
  `,
      [postId, body]
    )
    .then((res) => res.rows[0]);
};

const setBestAnswer = function (postId, answerId) {
  return db
    .query(
      `
    UPDATE posts
    SET best_answer = $2
    WHERE id = $1
    RETURNING *;
  `,
      [postId, answerId]
    )
    .then((res) => res.rows[0]);
};

const setAnonymity = function (postId, anonymous) {
  return db
    .query(
      `
    UPDATE posts
    SET anonymous = $2
    WHERE id = $1
    RETURNING *;
  `,
      [postId, anonymous]
    )
    .then((res) => res.rows[0]);
};

const setPinned = function (postId, pinned) {
  return db
    .query(
      `
    UPDATE posts
    SET pinned = $2
    WHERE id = $1
    RETURNING *;
  `,
      [postId, pinned]
    )
    .then((res) => res.rows[0]);
};

module.exports = {
  createPost,
  deletePost,
  getPostById,
  getCourseRoleFromPostId,
  getPostersCourseRole,
  getPosterId,
  setTitle,
  setBody,
  setBestAnswer,
  setAnonymity,
  setPinned,
};
