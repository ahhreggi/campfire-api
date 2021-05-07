const db = require("../index");

/**
 *
 * @param {Object} user - The user object to save.
 * @param {string} user.firstName - The user's first name.
 * @param {string} user.lastName - The user's last name.
 * @param {string} user.email - The user's email address.
 * @param {string} user.password - The user's hashed password.
 * @returns {Promise} Promise that resolves to true if user was saved successfully.
 */
const createUser = function (user) {
  const { firstName, lastName, email, password } = user;
  return db
    .query(
      `
    INSERT INTO users (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING email, id;
  `,
      [firstName, lastName, email, password]
    )
    .then((res) => res.rows);
};

/**
 *
 * @param {string} email - The user's email address
 * @returns {Object} User object
 */
const getUserByEmail = function (email) {
  return db
    .query(
      `
    SELECT *
    FROM users
    WHERE email = $1;
  `,
      [email]
    )
    .then((res) => res.rows[0]);
};

module.exports = { createUser, getUserByEmail };
