const Comments = require("../db/queries/comments");
const Courses = require("../db/queries/courses");
const Posts = require("../db/queries/posts");
const editable = require("./editable");

const canEditComment = function (userID, commentID) {
  return canEdit(userID, commentID, Comments);
};

const canEditPost = function (userID, postID) {
  return canEdit(userID, postID, Posts);
};

const canEdit = function (userID, contentID, contentType) {
  const pRole = contentType
    .course(contentID)
    .then((courseID) => Courses.role(courseID, userID));
  const pSubmitterRole = contentType.role(contentID);
  const pSubmitterID = contentType.author(contentID);
  return Promise.all([pRole, pSubmitterRole, pSubmitterID]).then((result) => {
    const [userRole, submitterRole, submitterID] = result;
    return editable(userRole, submitterRole, userID, submitterID);
  });
};

module.exports = { canEditComment, canEditPost };
