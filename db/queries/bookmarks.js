const db = require("../index");

/**
 *
 * @param {number} userID - The user's ID.
 * @param {number} postID - The post ID to bookmark.
 * @returns {Promise} A promise that resolves to the new bookmark object.
 */
const create = function (userID, postID) {
  return db
    .query(
      `
    INSERT INTO bookmarks (user_id, post_id)
    VALUES ($1, $2)
    RETURNING *;
  `,
      [userID, postID]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {Object} userID - The user's ID.
 * @param {Object} postID - The post ID.
 * @returns {Promise} A promise that resolves to the removed bookmark object.
 */
const remove = function (userID, postID) {
  return db
    .query(
      `
    DELETE FROM bookmarks
    WHERE user_id = $1
    AND post_id = $2
    RETURNING *;
  `,
      [userID, postID]
    )
    .then((res) => res.rows[0]);
};

module.exports = { create, remove };
