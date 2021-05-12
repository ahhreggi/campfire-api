const db = require("../index");
const editable = require("../../helpers/editable");

/**
 *
 * @param {number} courseID - The course ID.
 * @param {number} userID - The user's ID.
 * @returns {Promise} A promise that resolves to the user's role in the given course.
 */
const role = function (courseID, userID) {
  return db
    .query(
      `
    SELECT 
      CASE WHEN (SELECT is_admin FROM users WHERE id = $2) = TRUE THEN 'admin'
      ELSE (SELECT role FROM enrolments WHERE user_id = $2 AND course_id = $1)
    END AS role
  `,
      [courseID, userID]
    )
    .then((res) => res.rows[0].role);
};

/**
 *
 * @param {number} userID - The user's ID.
 * @returns {Promise} A promise that resolves to the list of courses the user has access to.
 */
const forUser = function (userID) {
  return db
    .query(
      `
    SELECT is_admin FROM users WHERE id = $1
  `,
      [userID]
    )
    .then((res) => {
      if (res.rows[0].is_admin) {
        // if user is admin they get all courses
        return db
          .query(
            `
          SELECT courses.id as id, name, courses.created_at as created_at, courses.archived as archived, 'admin' as role
          FROM courses
          WHERE courses.active = true;
        `
          )
          .then((res) => res.rows);
      } else {
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
            [userID]
          )
          .then((res) => res.rows);
      }
    });
};

/**
 *
 * @param {number} accessCode - The course access code.
 * @returns {Promise} A promise that resolves to the course for the given access code.
 */
const byAccessCode = function (accessCode) {
  return db
    .query(
      `
      SELECT *
      FROM courses
      WHERE student_access_code = $1
      OR instructor_access_code = $1;
  `,
      [accessCode]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} userID - The user's ID.
 * @param {number} courseID - The course ID.
 * @param {string} role - The role to assign the user.
 * @returns {Promise} A promise that resolves to the user enrolment object.
 */
const enrol = function (userID, courseID, role) {
  return db
    .query(
      `
      INSERT INTO enrolments (user_id, course_id, role)
      VALUES ($1, $2, $3)
      RETURNING *;
  `,
      [userID, courseID, role]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {Object} courseData - The course data.
 * @param {string} courseData.name - The course name.
 * @param {string} courseData.description - The course description.
 * @param {string} courseData.studentAccessCode - The course's student access code.
 * @param {string} courseData.instructorAccessCode - The course's instructor access code.
 * @returns {Promise} A promise that resolves to the new course object.
 */
const create = function (courseData) {
  const { name, description, studentAccessCode, instructorAccessCode } =
    courseData;
  return db
    .query(
      `
      INSERT INTO courses (name, description, student_access_code, instructor_access_code)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
  `,
      [name, description, studentAccessCode, instructorAccessCode]
    )
    .then((res) => res.rows[0]);
};

/**
 *
 * @param {number} courseID - The course ID.
 * @param {number} userID - The user's ID.
 * @returns {Promise} A promise that resolves to the full course object.
 */
const byId = function (courseID, userID) {
  const courseDataPromise = db.query(
    `
    SELECT 
      id, 
      name,
      description,
      archived,
      (SELECT COUNT(*) FROM enrolments WHERE course_id = $1) AS user_count,
      (SELECT COUNT(*) FROM posts WHERE course_id = $1) AS total_posts,
      (SELECT COUNT(*) FROM comments WHERE post_id IN (SELECT id FROM posts WHERE course_id = $1)) AS total_comments,
      (SELECT COUNT(*) FROM posts WHERE best_answer IS NOT NULL AND course_id = $1) AS num_resolved_questions,
      (SELECT COUNT(*) FROM posts WHERE best_answer IS NULL AND course_id = $1) AS num_unresolved_questions,
      student_access_code,
      instructor_access_code
    FROM courses
    WHERE id = $1;
  `,
    [courseID]
  );

  const courseRolePromise = db.query(
    `
    SELECT 
      CASE WHEN (SELECT is_admin FROM users WHERE id = $2) = TRUE THEN 'admin'
      ELSE (SELECT role FROM enrolments WHERE user_id = $2 AND course_id = $1)
    END AS role
  `,
    [courseID, userID]
  );

  const courseTagsPromise = db.query(
    `
    SELECT id, name FROM tags
    WHERE course_id = $1;
  `,
    [courseID]
  );

  const coursePostsPromise = db.query(
    `
    SELECT 
      id, 
      title, 
      body, 
      EXISTS (SELECT * FROM bookmarks WHERE post_id = posts.id AND user_id = $2) AS bookmarked,
      created_at,
      last_modified,
      best_answer,
      (SELECT first_name FROM users WHERE id = posts.user_id) AS author_first_name,
      (SELECT last_name FROM users WHERE id = posts.user_id) AS author_last_name,
      (SELECT avatar_id FROM users WHERE id = posts.user_id) AS author_avatar_id,
      pinned,
      (SELECT COUNT(*) FROM post_views WHERE post_id = posts.id) AS views,
      anonymous,
      CASE  
        WHEN (SELECT is_admin FROM users WHERE id = posts.user_id) = TRUE THEN 'admin'
        ELSE (SELECT role FROM enrolments WHERE user_id = posts.user_id AND course_id = $1) 
      END AS role,
      user_id
    FROM posts
    WHERE course_id = $1
    AND active = TRUE;
  `,
    [courseID, userID]
  );

  const courseCommentsPromise = db.query(
    `
    SELECT 
      id,
      post_id,
      anonymous,
      (SELECT first_name FROM users WHERE users.id = user_id) AS author_first_name,
      (SELECT last_name FROM users WHERE users.id = user_id) AS author_last_name,
      (SELECT avatar_id FROM users WHERE users.id = user_id) AS author_avatar_id,
      body,
      (SELECT COUNT(*) FROM comment_likes WHERE comment_id = comments.id) AS score,
      created_at,
      last_modified,
      EXISTS (SELECT * FROM comment_likes WHERE comment_id = comments.id AND user_id IN (SELECT user_id FROM enrolments WHERE course_id = $1 AND role IN ('instructor', 'owner'))) AS endorsed,
      CASE 
        WHEN (SELECT is_admin FROM users WHERE id = comments.user_id) = TRUE THEN 'admin'
        ELSE (SELECT role FROM enrolments WHERE user_id = comments.user_id AND course_id = $1) 
      END AS role,
      user_id
    FROM comments
    WHERE post_id in (SELECT id FROM posts WHERE course_id = $1)
    AND parent_id IS NULL
    AND active = TRUE;
  `,
    [courseID]
  );

  const courseCommentRepliesPromise = db.query(
    `
    SELECT 
      id,
      parent_id,
      anonymous,
      (SELECT first_name FROM users WHERE users.id = user_id) AS author_first_name,
      (SELECT last_name FROM users WHERE users.id = user_id) AS author_last_name,
      (SELECT avatar_id FROM users WHERE users.id = user_id) AS author_avatar_id,
      body,
      (SELECT COUNT(*) FROM comment_likes WHERE comment_id = comments.id) AS score,
      created_at,
      last_modified,
      CASE 
        WHEN (SELECT is_admin FROM users WHERE id = comments.user_id) = TRUE THEN 'admin'
        ELSE (SELECT role FROM enrolments WHERE user_id = comments.user_id AND course_id = $1) 
      END AS role,
      user_id
    FROM comments
    WHERE parent_id IN (SELECT id FROM comments WHERE post_id IN (SELECT id FROM posts WHERE course_id = $1))
    AND active = TRUE;
  `,
    [courseID]
  );

  const coursePostTagsPromise = db.query(
    `
    SELECT tags.id, name, post_id FROM tags
    JOIN post_tags ON tags.id = tag_id
    WHERE course_id = $1;
  `,
    [courseID]
  );

  const commentLikesPromise = db.query(
    `
    SELECT *
    FROM comment_likes
    WHERE user_id = $1;
  `,
    [userID]
  );

  const commentEndorsementsPromise = db.query(`
  WITH cte2 AS (
    WITH cte AS (
      SELECT 
        comment_likes.id as id, 
        user_id, 
        concat(first_name, ' ', last_name) AS endorser_name, 
        comment_id
      FROM comment_likes
      JOIN users ON user_id = users.id
    )
    SELECT cte.id, cte.user_id, cte.endorser_name, cte.comment_id, role 
    FROM cte
    JOIN comments ON comment_id = comments.id
    JOIN posts ON post_id = posts.id
    INNER JOIN enrolments 
      ON enrolments.course_id = posts.course_id
      AND enrolments.user_id = cte.user_id)
    SELECT id, user_id, endorser_name, comment_id FROM cte2
    WHERE role IN ('instructor', 'owner', 'admin');
  `);

  return Promise.all([
    courseDataPromise,
    courseRolePromise,
    courseTagsPromise,
    coursePostsPromise,
    courseCommentsPromise,
    courseCommentRepliesPromise,
    coursePostTagsPromise,
    commentLikesPromise,
    commentEndorsementsPromise,
  ]).then(
    ([
      courseData,
      courseRole,
      courseTags,
      coursePosts,
      courseComments,
      courseCommentReplies,
      coursePostTags,
      commentLikes,
      commentEndorsements,
    ]) => {
      const { role } = courseRole.rows[0];

      const compiledCourseData = {
        id: courseData.rows[0].id,
        name: courseData.rows[0].name,
        description: courseData.rows[0].description,
        archived: courseData.rows[0].archived,
        analytics: {
          user_count: courseData.rows[0].user_count,
          total_posts: courseData.rows[0].total_posts,
          total_comments: courseData.rows[0].total_comments,
          num_unresolved_questions: courseData.rows[0].num_unresolved_questions,
          num_resolved_questions: courseData.rows[0].num_resolved_questions,
        },
        secrets: {
          student_access_code: courseData.rows[0].student_access_code,
          instructor_access_code: courseData.rows[0].instructor_access_code,
        },
        tags: courseTags.rows,
        posts: coursePosts.rows.map((post) => ({
          ...post,
          views: parseInt(post.views),
          editable: editable(role, post.role, userID, post.user_id),
          pinnable: pinnable(role),
          tags: coursePostTags.rows
            .filter((postTag) => postTag.post_id === post.id)
            .map((tag) => {
              delete tag.post_id;
              return tag;
            }),
          comments: courseComments.rows
            .filter((comment) => comment.post_id === post.id)
            .map((comment) => ({
              ...comment,
              score: parseInt(comment.score),
              editable: editable(role, comment.role, userID, comment.user_id),
              endorsable: endorsable(role),
              liked:
                commentLikes.rows.filter(
                  (like) => like.comment_id === comment.id
                ).length > 0,
              user_is_post_author: userID === post.user_id,
              endorsements: commentEndorsements.rows.filter(
                (endorsement) => endorsement.comment_id === comment.id
              ),
              replies: courseCommentReplies.rows
                .filter((reply) => reply.parent_id === comment.id)
                .map((reply) => ({
                  ...reply,
                  score: parseInt(reply.score),
                  editable: editable(role, reply.role, userID, reply.user_id),
                  endorsable: endorsable(role),
                  liked:
                    commentLikes.rows.filter(
                      (like) => like.comment_id === reply.id
                    ).length > 0,
                  user_is_post_author: userID === post.user_id,
                  endorsements: commentEndorsements.rows.filter(
                    (endorsement) => endorsement.comment_id === reply.id
                  ),
                })),
            })),
        })),
      };

      if (role === "student") {
        // Remove secrets & names from posts/comments/replies marked as anonymous
        delete compiledCourseData.secrets;
        compiledCourseData.posts = compiledCourseData.posts.map((post) => {
          if (post.anonymous) {
            post = anonymize(post);
          }
          post.comments = post.comments.map((comment) => {
            if (comment.anonymous) {
              comment = anonymize(comment);
            }
            comment.replies = comment.replies.map((reply) => {
              if (reply.anonymous) {
                reply = anonymize(reply);
              }
              return reply;
            });
            return comment;
          });
          return post;
        });
      }

      return Promise.resolve(compiledCourseData);
    }
  );
};

/*
 * Helper functions
 */

// strips author name and avatar from posts/comments/replies
const anonymize = function (obj) {
  delete obj.author_first_name;
  delete obj.author_last_name;
  obj.author_avatar_id = 1;
  return obj;
};

const endorsable = function (role) {
  return role === "admin" || role === "owner" || role === "instructor";
};
const pinnable = endorsable;

module.exports = {
  role,
  forUser,
  byId,
  byAccessCode,
  enrol,
  create,
};
