// Determines if a given user has edit permissions on a given post
const editable = function (role, posterRole, userId, posterId) {
  const ADMIN = "admin";
  const OWNER = "owner";
  const INSTRUCTOR = "instructor";
  const STUDENT = "student";

  // admins can edit any post
  if (role === ADMIN) return true;
  // owner can edit posts from lower permissioned users
  if (role === OWNER && posterRole !== ADMIN && posterRole !== OWNER)
    return true;
  // instructors can edit posts from lower permissioned users
  if (
    role === INSTRUCTOR &&
    posterRole !== ADMIN &&
    posterRole !== OWNER &&
    posterRole !== INSTRUCTOR
  )
    return true;
  // users can edit their own posts
  if (posterId === userId) return true;
  // otherwise, no
  return false;
};

module.exports = { editable };
