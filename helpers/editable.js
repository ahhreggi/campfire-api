const { roles } = require("../db/queries/users");

// Determines if a given user has edit permissions on a given post
const editable = function (userRole, posterRole, userID, posterID) {
  const { ADMIN, OWNER, INSTRUCTOR } = roles;

  // admins can edit any post
  if (userRole === ADMIN) return true;
  // owner can edit posts from lower permissioned users
  if (userRole === OWNER && posterRole !== ADMIN && posterRole !== OWNER)
    return true;
  // instructors can edit posts from lower permissioned users
  if (
    userRole === INSTRUCTOR &&
    posterRole !== ADMIN &&
    posterRole !== OWNER &&
    posterRole !== INSTRUCTOR
  )
    return true;
  // users can edit their own posts
  if (posterID === userID) return true;
  // otherwise, no
  return false;
};

module.exports = editable;
