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
 * @param {number} user.avatarID - The user's avatar ID.
 * @returns {Promise} Promise that resolves to the new user object (minus password).
 */
const create = function (user) {
  const { firstName, lastName, email, password, avatarID } = user;
  return db
    .query(
      `
    INSERT INTO users (first_name, last_name, email, password, avatar_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING email, first_name, last_name, avatar_id;
  `,
      [firstName, lastName, email, password, avatarID]
    )
    .then((res) => res.rows);
};

/**
 *
 * @param {string} email - The user's email address.
 * @returns {Promise} A promise that resolves to the user object.
 */
const byEmail = function (email) {
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

/**
 *
 * @param {number} userID - The user's id.
 * @returns {Promise} A promise that resolves to the user's admin status.
 */
const isAdmin = function (userID) {
  return db
    .query(
      `
    SELECT is_admin
    FROM users
    WHERE id = $1;
  `,
      [userID]
    )
    .then((res) => res.rows[0].is_admin);
};

module.exports = { create, byEmail, isAdmin, roles };
