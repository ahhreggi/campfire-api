const db = require("../index");

const getCoursesForUser = function (userId) {
  return db
    .query(
      `
    SELECT courses.id as id, name, courses.created_at as created_at, courses.archived as archived, enrolments.role as role
    FROM courses
    JOIN enrolments ON course_id = courses.id
    JOIN users ON user_id = users.id
    WHERE users.id = $1
    AND courses.active = true;
  `,
      [userId]
    )
    .then((res) => res.rows);
};

module.exports = { getCoursesForUser };
