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

const getCourseRoleFromCommentId = function (commentId, userId) {
  return db
    .query(
      `
    SELECT post_id
    FROM comments
    WHERE id = $1
  `,
      [commentId]
    )
    .then((res) => res.rows[0].post_id)
    .then((postId) =>
      db.query(
        `
    SELECT course_id 
    FROM posts
    WHERE id = $1;
  `,
        [postId]
      )
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

const getCommentorsCourseRole = function (commentId) {
  return db
    .query(
      `
    SELECT comments.user_id, course_id
    FROM comments
    JOIN posts ON posts.id = post_id
    WHERE comments.id = $1;
  `,
      [commentId]
    )
    .then((res) => res.rows[0])
    .then((res) =>
      db.query(
        `
    SELECT 
    CASE 
      WHEN (SELECT is_admin FROM users WHERE id = $1) = TRUE THEN 'admin'
      ELSE (SELECT role FROM enrolments WHERE user_id = $1 AND course_id = $2) 
    END AS role
  `,
        [res.user_id, res.course_id]
      )
    )
    .then((res) => res.rows[0].role);
};

const getCommentorId = function (commentId) {
  return db
    .query(
      `
    SELECT user_id
    FROM comments
    WHERE id = $1;
  `,
      [commentId]
    )
    .then((res) => res.rows[0].user_id);
};

const setBody = function (commentId, body) {
  return db
    .query(
      `
    UPDATE comments
    SET body = $2, last_modified = now()
    WHERE id = $1
    RETURNING *;
  `,
      [commentId, body]
    )
    .then((res) => res.rows[0]);
};

const setAnonymity = function (commentId, anonymous) {
  return db.query(
    `
    UPDATE comments
    SET anonymous = $2
    WHERE id = $1
    RETURNING *;
  `,
    [commentId, anonymous]
  );
};

const getCommentById = function (commentId) {
  return db
    .query(
      `
    SELECT *
    FROM comments
    WHERE id = $1;
  `,
      [commentId]
    )
    .then((res) => res.rows[0]);
};

const deleteComment = function (commentId) {
  return db
    .query(
      `
      UPDATE comments
      SET active = false
      WHERE id = $1
      RETURNING *;
    `,
      [commentId]
    )
    .then((res) => res.rows[0]);
};

const likeComment = function (commentId, userId) {
  return db
    .query(
      `
    INSERT INTO comment_likes (user_id, comment_id)
    VALUES ($1, $2)
    RETURNING *;
  `,
      [userId, commentId]
    )
    .then((res) => res.rows[0]);
};

const unlikeComment = function (commentId, userId) {
  return db
    .query(
      `
    DELETE FROM comment_likes
    WHERE user_id = $1
    AND comment_id = $2
    RETURNING *;
    `,
      [userId, commentId]
    )
    .then((res) => res.rows[0]);
};

const getCommentsForPost = function (postId) {
  return db
    .query(
      `
    SELECT * FROM comments
    WHERE post_id = $1;
  `,
      [postId]
    )
    .then((res) => res.rows);
};

module.exports = {
  createComment,
  getCourseRoleFromCommentId,
  getCommentorsCourseRole,
  getCommentorId,
  setBody,
  setAnonymity,
  getCommentById,
  deleteComment,
  likeComment,
  unlikeComment,
  getCommentsForPost,
};
