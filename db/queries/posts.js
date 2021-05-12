const db = require("../index");

const create = function (post) {
  const { userID, courseID, title, body, anonymous = false } = post;
  return db
    .query(
      `
      INSERT INTO posts (user_id, course_id, title, body, anonymous)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
  `,
      [userID, courseID, title, body, anonymous]
    )
    .then((res) => res.rows[0]);
};

const remove = function (postId) {
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

const course = function (postID) {
  return db
    .query(
      `
    SELECT course_id
    FROM posts
    WHERE id = $1;
  `,
      [postID]
    )
    .then((res) => res.rows[0].course_id);
};

const getByID = function (postID) {
  return db
    .query(
      `
    SELECT *
    FROM posts
    WHERE id = $1;  
`,
      [postID]
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

const role = function (postID) {
  return db
    .query(
      `
      WITH user_id AS (
        SELECT user_id FROM posts WHERE id = $1
      )
      SELECT 
        CASE WHEN (SELECT is_admin FROM users WHERE id = (SELECT * FROM user_id)) = TRUE THEN 'admin'
        ELSE (
          SELECT role
          FROM enrolments
          JOIN posts ON posts.course_id = enrolments.course_id
          WHERE posts.id = $1
          AND enrolments.user_id = posts.user_id
        )
      END AS role
    `,
      [postID]
    )
    .then((res) => res.rows[0].role);
};

const author = function (postID) {
  return db
    .query(
      `
    SELECT user_id
    FROM posts
    WHERE id = $1;
  `,
      [postID]
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
  create,
  remove,
  course,
  getByID,
  getCourseRoleFromPostId,
  role,
  author,
  setTitle,
  setBody,
  setBestAnswer,
  setAnonymity,
  setPinned,
};
