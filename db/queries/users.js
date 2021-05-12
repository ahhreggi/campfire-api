const db = require("../index");

const roles = {
  ADMIN: "admin",
  OWNER: "owner",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
};

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
  const { firstName, lastName, email, password, avatarId } = user;
  return db
    .query(
      `
    INSERT INTO users (first_name, last_name, email, password, avatar_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING email, first_name, last_name, avatar_id;
  `,
      [firstName, lastName, email, password, avatarId]
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

const userIsAdmin = function (userId) {
  return db
    .query(
      `
    SELECT is_admin
    FROM users
    WHERE id = $1;
  `,
      [userId]
    )
    .then((res) => res.rows[0].is_admin);
};

module.exports = { createUser, getUserByEmail, userIsAdmin, roles };
