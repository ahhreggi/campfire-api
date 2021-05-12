const db = require("../index");

/**
 *
 * @param {Object} post               The post data.
 * @param {number} post.userID        The user's ID.
 * @param {number} post.courseID      The course ID.
 * @param {string} post.title         The post title.
 * @param {string} post.body          The post body.
 * @param {boolean} post.anonymous    If the post should be anonymous.
 * @returns {Promise}                 A promise that resolves to the new post object.
 */
const create = function (post) {
  const { userID, courseID, title, body, tags = [], anonymous = false } = post;
  return db
    .query(
      `
      INSERT INTO posts (user_id, course_id, title, body, anonymous)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
  `,
      [userID, courseID, title, body, anonymous]
    )
    .then((res) => res.rows[0])
    .then((post) => {
      const tagInserts = [];
      for (tag of tags) {
        tagInserts.push(
          db.query(
            `
          INSERT INTO post_tags (tag_id, post_id)
          VALUES ($1, $2)
        `,
            [tag, post.id]
          )
        );
      }
      return Promise.all([Promise.resolve(post), tagInserts]);
    })
    .then((res) => res[0]);
};

/**
 *
 * @param {number} postID    The post ID.
 * @returns {Promise}        A promise that resolves to the removed post object.
 */
const remove = function (postID) {
  return db
    .query(
      `
    UPDATE posts
    SET active = false
    WHERE id = $1
    RETURNING *;
  `,
      [postID]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} postID    The post ID.
 * @returns {Promise}        A promise that resolves to the posts course_id.
 */
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

/**
 *
 * @param {number} postID    The post ID.
 * @returns {Promise}        A promise that resolves to the post object.
 */
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

/**
 *
 * @param {number} postID    The post ID.
 * @returns {Promise}        A promise that resolves to the post author's role.
 */
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

/**
 *
 * @param {number} postID    The post ID.
 * @returns {Promise}        A promise that resolves to the post author's user_id.
 */
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

/**
 *
 * @param {number} postID    The post ID.
 * @param {string} title     The post title.
 * @returns {Promise}        A promise that resolves to the updated post object.
 */
const setTitle = function (postID, title) {
  return db
    .query(
      `
    UPDATE posts
    SET title = $2, last_modified = now()
    WHERE id = $1
    RETURNING *;
  `,
      [postID, title]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} postID    The post ID.
 * @param {string} body     The post body.
 * @returns {Promise}        A promise that resolves to the updated post object.
 */
const setBody = function (postID, body) {
  return db
    .query(
      `
    UPDATE posts
    SET body = $2, last_modified = now()
    WHERE id = $1
    RETURNING *;
  `,
      [postID, body]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} postID          The post ID.
 * @param {Array<number>} tags     The array of tags to assign to the post.
 * @returns {Promise}              A promise that resolves when the update is complete.
 */
const setTags = function (postID, tags) {
  return db
    .query(
      `
    DELETE FROM post_tags
    WHERE post_id = $1;
  `,
      [postID]
    )
    .then(() => {
      const tagInserts = [];
      for (tag of tags) {
        db.query(
          `
      INSERT INTO post_tags (tag_id, post_id)
      VALUES ($2, $1)
    `,
          [postID, tag]
        );
      }
      return Promise.all([tagInserts]);
    });
};

/**
 *
 * @param {number} postID    The post ID.
 * @param {number} answerID     The 'best answer' post ID.
 * @returns {Promise}        A promise that resolves to the updated post object.
 */
const setBestAnswer = function (postID, answerID) {
  return db
    .query(
      `
    UPDATE posts
    SET best_answer = $2
    WHERE id = $1
    RETURNING *;
  `,
      [postID, answerID]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} postID       The post ID.
 * @param {boolean} anonymous   The post's anonymity status.
 * @returns {Promise}           A promise that resolves to the updated post object.
 */
const setAnonymity = function (postID, anonymous) {
  return db
    .query(
      `
    UPDATE posts
    SET anonymous = $2
    WHERE id = $1
    RETURNING *;
  `,
      [postID, anonymous]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} postID    The post ID.
 * @param {boolean} pinned   The post's pinned status.
 * @returns {Promise}        A promise that resolves to the updated post object.
 */
const setPinned = function (postID, pinned) {
  return db
    .query(
      `
    UPDATE posts
    SET pinned = $2
    WHERE id = $1
    RETURNING *;
  `,
      [postID, pinned]
    )
    .then((res) => res.rows[0]);
};

module.exports = {
  create,
  remove,
  course,
  getByID,
  role,
  author,
  setTitle,
  setBody,
  setTags,
  setBestAnswer,
  setAnonymity,
  setPinned,
};
