const editable = function (role, posterRole, userId, posterId) {
  // admins can edit any post
  if (role === "admin") return true;
  // owner can edit posts from lower permissioned users, and other owners
  if (role === "owner" && posterRole !== "admin") return true;
  // instructors can edit posts from lower permissioned users, and other instructors
  if (role === "instructor" && posterRole !== "admin" && posterRole !== "owner")
    return true;
  // user can edit their own posts
  if (posterId === userId) return true;
  // otherwise, no
  return false;
};

module.exports = { editable };
