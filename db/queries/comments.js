const db = require("../index");

/**
 *
 * @param {Object} comment              The comment data.
 * @param {string} comment.postID       The post_id where the comment is being posted.
 * @param {string} comment.parentID     The comment_id of the parent comment (if a reply).
 * @param {string} comment.userID       The user_id of the comment author.
 * @param {string} comment.body         The comment body.
 * @param {string} comment.anonymous    The comment's anonymity status.
 * @returns {Promise}                   A promise that resolves to the new comment object.
 */
const create = function (comment) {
  const { postID, parentID = null, userID, body, anonymous = false } = comment;
  return db
    .query(
      `
    INSERT INTO comments (post_id, parent_id, user_id, body, anonymous)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `,
      [postID, parentID, userID, body, anonymous]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} commentID     The comment ID.
 * @returns {Promise}            A promise that resolves to true if the comment is a reply.
 */
const isReply = function (commentID) {
  return db
    .query(
      `
    SELECT parent_id
    FROM comments
    WHERE id = $1;
  `,
      [commentID]
    )
    .then((res) => Boolean(res.rows[0].parent_id));
};

/**
 *
 * @param {number} commentID     The comment ID.
 * @returns {Promise}            A promise that resolves to the course_id where the comment was posted.
 */
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

/**
 *
 * @param {number} commentID     The comment ID.
 * @returns {Promise}            A promise that resolves to the role of the comment author.
 */
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

/**
 *
 * @param {number} commentID     The comment ID.
 * @returns {Promise}            A promise that resolves to the user_id of the comment author.
 */
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

/**
 *
 * @param {number} commentID     The comment ID.
 * @param {string} body          The comment body.
 * @returns {Promise}            A promise that resolves to the updated comment.
 */
const setBody = function (commentID, body) {
  return db
    .query(
      `
    UPDATE comments
    SET body = $2, last_modified = now()
    WHERE id = $1
    RETURNING *;
  `,
      [commentID, body]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} commentID     The comment ID.
 * @param {boolean} anonymous    The comment's anonymity status.
 * @returns {Promise}            A promise that resolves to the updated comment.
 */
const setAnonymity = function (commentID, anonymous) {
  return db.query(
    `
    UPDATE comments
    SET anonymous = $2
    WHERE id = $1
    RETURNING *;
  `,
    [commentID, anonymous]
  );
};

/**
 *
 * @param {number} commentID     The comment ID.
 * @returns {Promise}            A promise that resolves to the comment object.
 */
const getByID = function (commentID) {
  return db
    .query(
      `
    SELECT *
    FROM comments
    WHERE id = $1;
  `,
      [commentID]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} commentID     The comment ID.
 * @returns {Promise}            A promise that resolves to the removed comment.
 */
const remove = function (commentID) {
  return db
    .query(
      `
      UPDATE comments
      SET active = false
      WHERE id = $1
      RETURNING *;
    `,
      [commentID]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} commentID  The comment ID.
 * @param {number} userID     The user's ID.
 * @returns {Promise}         A promise that resolves to the new comment_like object.
 */
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

/**
 *
 * @param {number} commentID  The comment ID.
 * @param {number} userID     The user's ID.
 * @returns {Promise}         A promise that resolves to the deleted comment_like object.
 */
const unlike = function (commentID, userID) {
  return db
    .query(
      `
    DELETE FROM comment_likes
    WHERE user_id = $1
    AND comment_id = $2
    RETURNING *;
    `,
      [userID, commentID]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} postID     The post's ID.
 * @returns {Promise}         A promise that resolves to the array of comments for the post.
 */
const forPost = function (postID) {
  return db
    .query(
      `
    SELECT * FROM comments
    WHERE post_id = $1
    AND active = TRUE;
  `,
      [postID]
    )
    .then((res) => res.rows);
};

module.exports = {
  create,
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
