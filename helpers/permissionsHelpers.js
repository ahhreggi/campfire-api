const Comments = require("../db/queries/comments");
const Courses = require("../db/queries/courses");
const Posts = require("../db/queries/posts");
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

const canEditPost = function (userID, postID) {
  const pRole = Posts.course(postID).then((courseID) =>
    Courses.role(courseID, userID)
  );
  const pPosterRole = Posts.role(postID);
  const pPosterID = Posts.author(postID);

  return Promise.all([pRole, pPosterRole, pPosterID]).then((result) => {
    const [userRole, posterRole, posterID] = result;
    return editable(userRole, posterRole, userID, posterID);
  });
};

module.exports = { canEditComment, canEditPost };
