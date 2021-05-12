const Comments = require("../db/queries/comments");
const Courses = require("../db/queries/courses");
const editable = require("./editable");

const canEditComment = function (userID, commentID) {
  const pRole = Comments.course(commentID).then((courseID) =>
    Courses.role(courseID, userID)
  );
  const pCommentorRole = Comments.role(commentID);
  const pCommentorID = Comments.author(commentID);

  return Promise.all([pRole, pCommentorRole, pCommentorID]).then((result) => {
    const [userRole, commentorRole, commentorID] = result;
    return editable(userRole, commentorRole, userID, commentorID);
  });
};

module.exports = { canEditComment };
