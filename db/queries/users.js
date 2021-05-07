const db = require("../index");

/**
 *
 * @param {Object} user - The user object to save.
 * @param {string} user.firstName - The user's first name.
 * @param {string} user.lastName - The user's last name.
 * @param {string} user.email - The user's email address.
 * @param {string} user.password - The user's hashed password.
 */

const createNewUser = function (user) {
  const { firstName, lastName, email, password } = user;
  return db
    .query(
      `
    INSERT INTO users (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
  `,
      [firstName, lastName, email, password]
    )
    .then((res) => res.rows);
};

module.exports = { createNewUser };
