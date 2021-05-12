const db = require("../index");

const create = function (commentData) {
  const {
    postID,
    parentID = null,
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
      [postID, parentID, userId, body, anonymous]
    )
    .then((res) => res.rows[0]);
};

const isReply = function (commentId) {
  return db
    .query(
      `
    SELECT parent_id
    FROM comments
    WHERE id = $1;
  `,
      [commentId]
    )
    .then((res) => Boolean(res.rows[0].parent_id));
};

// Returns the id of the course where the comment was made
const course = function (commentID) {
  return db
    .query(
      `
    SELECT course_id as id
    FROM comments
    JOIN posts ON post_id = posts.id
    WHERE comments.id = $1;
  `,
      [commentID]
    )
    .then((res) => res.rows[0].id);
};

const role = function (commentID) {
  return db
    .query(
      `
    WITH user_id AS (
      SELECT user_id FROM comments WHERE id = $1
    )
    SELECT 
      CASE WHEN (SELECT is_admin FROM users WHERE id = (SELECT * FROM user_id)) = TRUE THEN 'admin'
      ELSE (
        SELECT role
        FROM enrolments
        JOIN posts ON posts.course_id = enrolments.course_id
        JOIN comments ON comments.post_id = posts.id
        WHERE comments.id = $1
        AND enrolments.user_id = comments.user_id
      )
    END AS role
  `,
      [commentID]
    )
    .then((res) => res.rows[0].role);
};

const author = function (commentID) {
  return db
    .query(
      `
    SELECT user_id
    FROM comments
    WHERE id = $1
  `,
      [commentID]
    )
    .then((res) => res.rows[0].user_id);
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

const getByID = function (commentId) {
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

const remove = function (commentId) {
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

const like = function (commentID, userID) {
  return db
    .query(
      `
    INSERT INTO comment_likes (user_id, comment_id)
    VALUES ($1, $2)
    RETURNING *;
  `,
      [userID, commentID]
    )
    .then((res) => res.rows[0]);
};

const unlike = function (commentId, userId) {
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

const forPost = function (postId) {
  return db
    .query(
      `
    SELECT * FROM comments
    WHERE post_id = $1
    AND active = TRUE;
  `,
      [postId]
    )
    .then((res) => res.rows);
};

module.exports = {
  create: create,
  getCourseRoleFromCommentId,
  course,
  role,
  author,
  isReply,
  setBody,
  setAnonymity,
  getByID,
  remove,
  like,
  unlike,
  forPost,
};
