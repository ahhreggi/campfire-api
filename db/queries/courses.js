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
      ELSE (SELECT role FROM enrolments WHERE user_id = $2 AND course_id = $1 AND active = TRUE)
    END AS role
  `,
      [courseID, userID]
    )
    .then((res) => res.rows[0].role);
};

const users = function (courseID) {
  return db
    .query(
      `
      SELECT 
        users.id AS user_id,
        users.first_name AS first_name,
        users.last_name AS last_name,
        users.avatar_id AS avatar_id,
        enrolments.role AS role
      FROM courses
      INNER JOIN enrolments ON courses.id = course_id
      INNER JOIN users ON user_id = users.id
      WHERE courses.id = $1;
  `,
      [courseID]
    )
    .then((res) => res.rows);
};

const posts = function (courseID, userID) {
  return db
    .query(
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
      user_id AS author_id
    FROM posts
    WHERE course_id = $1
    AND active = TRUE;
  `,
      [courseID, userID]
    )
    .then((res) => res.rows);
};

const tags = function (courseID) {
  return db
    .query(
      `
    SELECT id, name FROM tags
    WHERE course_id = $1;
  `,
      [courseID]
    )
    .then((res) => res.rows);
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
          SELECT id 
          FROM courses;
        `
          )
          .then((res) => res.rows);
      } else {
        return db
          .query(
            `
          SELECT course_id AS id
          FROM enrolments
          WHERE user_id = $1
          AND active = TRUE;
        `,
            [userID]
          )
          .then((res) => res.rows);
      }
    })
    .then((courses) => {
      const queries = [];
      for (course of courses) {
        queries.push(byID(course.id, userID));
      }
      return Promise.all(queries);
    })
    .then((courseData) =>
      courseData.map((course) => {
        delete course.secrets;
        delete course.users;
        delete course.tags;
        delete course.posts;
        return course;
      })
    );
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
    SELECT * FROM enrolments
    WHERE user_id = $1
    AND course_id = $2;
  `,
      [userID, courseID]
    )
    .then((res) => {
      if (res.rows.length > 0 && res.rows[0].active === true) {
        // If user is already enrolled, reject
        return Promise.reject({
          status: 200,
          message: "User already enrolled in this course",
        });
      } else if (res.rows.length > 0) {
        // User was previously enrolled, set active with new role
        return db.query(
          `
          UPDATE enrolments
          SET active = TRUE, role = $3
          WHERE course_id = $1
          AND user_id = $2
          RETURNING *;
        `,
          [courseID, userID, role]
        );
      } else {
        // User is not enrolled, insert
        return db.query(
          `
      INSERT INTO enrolments (user_id, course_id, role)
      VALUES ($1, $2, $3)
      RETURNING *;
  `,
          [userID, courseID, role]
        );
      }
    })
    .then((res) => res.rows[0]);
};

const unenrol = function (courseID, userID) {
  return db
    .query(
      `
    UPDATE enrolments
    SET active = FALSE
    WHERE user_id = $1 
    AND course_id = $2
    RETURNING *;
  `,
      [userID, courseID]
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
  const {
    name,
    description,
    courseCode,
    studentAccessCode,
    instructorAccessCode,
  } = courseData;
  return db
    .query(
      `
      INSERT INTO courses (name, description, course_code, student_access_code, instructor_access_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
  `,
      [name, description, courseCode, studentAccessCode, instructorAccessCode]
    )
    .then((res) => res.rows[0]);
};

const updateTags = function (courseID, newTags) {
  // Get current tags
  return tags(courseID)
    .then((oldTags) => {
      // Identify deleted tags
      const deletedTags = oldTags.filter(
        (oldTag) => !newTags.includes(oldTag.name)
      );
      // Delete these tags (will cascade and remove post_tags entries too)
      const queries = [];
      for (deletedTag of deletedTags) {
        queries.push(
          db.query(
            `
      DELETE FROM tags
      WHERE id = $1;
    `,
            [deletedTag.id]
          )
        );
      }
      return Promise.all(queries).then(() => {
        // Identify new tags
        const tagsToInsert = newTags.filter(
          (newTag) => !oldTags.some((oldTag) => oldTag.name === newTag)
        );
        // Insert these into db
        const queries = [];
        for (tagToInsert of tagsToInsert) {
          queries.push(
            db.query(
              `
            INSERT INTO tags (course_id, name)
            VALUES ($1, $2);
          `,
              [courseID, tagToInsert]
            )
          );
        }
        return Promise.all(queries);
      });
    })
    .then(() => {
      // Get updated list of course tags to send back
      return tags(courseID);
    });
};

const updateName = function (courseID, name) {
  return db
    .query(
      `
    UPDATE courses
    SET name = $2
    WHERE id = $1
    RETURNING *;
  `,
      [courseID, name]
    )
    .then((res) => res.rows);
};

const updateDescription = function (courseID, description) {
  return db
    .query(
      `
    UPDATE courses
    SET description = $2
    WHERE id = $1
    RETURNING *;
  `,
      [courseID, description]
    )
    .then((res) => res.rows);
};

const archive = function (courseID, archive) {
  return db
    .query(
      `
      UPDATE courses
      SET archived = $2
      WHERE id = $1
      RETURNING *;
    `,
      [courseID, archive]
    )
    .then((res) => res.rows);
};

const updateRole = function (courseID, userID, role) {
  // Delete the existing role
  return db
    .query(
      `
      DELETE FROM enrolments
      WHERE user_id = $2
      AND course_id = $1
      RETURNING *;
    `,
      [courseID, userID]
    )
    .then(() => {
      // If we received a new role, insert it
      if (role !== null) {
        return enrol(userID, courseID, role);
      }
    });
};

const updateCourseCode = function (courseID, courseCode) {
  return db
    .query(
      `
    UPDATE courses
    SET course_code = $2
    WHERE id = $1;
  `,
      [courseID, courseCode]
    )
    .then((res) => res.rows);
};

const setAccessCodes = function (
  courseID,
  studentAccessCode,
  instructorAccessCode
) {
  return db
    .query(
      `
    UPDATE courses
    SET student_access_code = $1, instructor_access_code = $2
    WHERE id = $3
    RETURNING *;
  `,
      [studentAccessCode, instructorAccessCode, courseID]
    )
    .then((res) => res.rows);
};

const remove = function (courseID) {
  return db
    .query(
      `
    UPDATE courses
    SET active = false
    WHERE id = $1;
  `,
      [courseID]
    )
    .then((res) => res.rowCount === 1);
};

const data = function (courseID) {
  return db.query(
    `
  SELECT 
      id, 
      name,
      description,
      archived,
      (SELECT COUNT(*) FROM enrolments WHERE course_id = $1 AND active = TRUE) AS user_count,
      (SELECT COUNT(*) FROM posts WHERE course_id = $1 AND active = TRUE) AS total_posts,
      (SELECT COUNT(*) FROM comments WHERE post_id IN (SELECT id FROM posts WHERE course_id = $1) AND active = TRUE) AS total_comments,
      (SELECT COUNT(*) FROM posts WHERE best_answer IS NOT NULL AND course_id = $1 AND active = TRUE) AS num_resolved_posts,
      (SELECT COUNT(*) FROM posts WHERE best_answer IS NULL AND course_id = $1 AND active = TRUE) AS num_unresolved_posts,
      (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = (SELECT user_id FROM enrolments WHERE role='owner' AND course_id = $1)) AS owner_name,
      student_access_code,
      instructor_access_code,
      course_code,
      created_at,
      active
    FROM courses
    WHERE id = $1;
  `,
    [courseID]
  );
};

/**
 *
 * @param {number} courseID - The course ID.
 * @param {number} userID - The user's ID.
 * @returns {Promise} A promise that resolves to the full course object.
 */
const byID = function (courseID, userID) {
  const courseExistsPromise = db.query(
    `
    SELECT *
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

  const courseJoinDatePromise = db.query(
    `
    SELECT join_date
    FROM enrolments
    WHERE user_id = $1
    AND course_id = $2;
  `,
    [userID, courseID]
  );

  const courseTagsPromise = db.query(
    `
    SELECT id, name FROM tags
    WHERE course_id = $1;
  `,
    [courseID]
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
      user_id AS author_id
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
      user_id AS author_id
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

  const coursePostViewsPromise = db
    .query(
      `
      SELECT post_views.user_id, post_views.post_id
      FROM post_views
      INNER JOIN posts ON posts.id = post_id
      INNER JOIN courses ON courses.id = course_id
      WHERE courses.id = $1
      AND post_views.user_id = $2;
  `,
      [courseID, userID]
    )
    .then((res) => res.rows);

  const coursePostEditsPromise = db
    .query(
      `
    SELECT 
      post_edits.user_id,
      post_edits.post_id,
      first_name,
      last_name,
      CASE 
        WHEN (SELECT is_admin FROM users WHERE id = post_edits.user_id) = TRUE THEN 'admin'
        ELSE (SELECT role FROM enrolments WHERE user_id = post_edits.user_id AND course_id = posts.course_id) 
      END AS role,
      edited_at
    FROM post_edits
    INNER JOIN users ON post_edits.user_id = users.id
    INNER JOIN posts ON post_edits.post_id = posts.id
    WHERE posts.course_id = $1;
  `,
      [courseID]
    )
    .then((res) => res.rows);

  const courseCommentEditsPromise = db
    .query(
      `
    SELECT 
      comment_edits.user_id,
      comment_edits.comment_id,
      first_name,
      last_name,
      CASE 
        WHEN (SELECT is_admin FROM users WHERE id = comment_edits.user_id) = TRUE THEN 'admin'
        ELSE (SELECT role FROM enrolments WHERE user_id = comment_edits.user_id AND course_id = posts.course_id) 
      END AS role,
      edited_at
    FROM comment_edits
    INNER JOIN users ON comment_edits.user_id = users.id
    INNER JOIN comments ON comment_edits.comment_id = comments.id
    INNER JOIN posts ON comments.post_id = posts.id
    WHERE posts.course_id = $1;
  `,
      [courseID]
    )
    .then((res) => res.rows);

  return Promise.all([
    courseExistsPromise,
    data(courseID),
    courseRolePromise,
    courseJoinDatePromise,
    courseTagsPromise,
    posts(courseID, userID),
    users(courseID),
    courseCommentsPromise,
    courseCommentRepliesPromise,
    coursePostTagsPromise,
    commentLikesPromise,
    commentEndorsementsPromise,
    coursePostViewsPromise,
    coursePostEditsPromise,
    courseCommentEditsPromise,
  ]).then(
    ([
      courseExists,
      courseData,
      courseRole,
      courseJoinDate,
      courseTags,
      coursePosts,
      courseUsers,
      courseComments,
      courseCommentReplies,
      coursePostTags,
      commentLikes,
      commentEndorsements,
      coursePostViews,
      coursePostEdits,
      courseCommentEdits,
    ]) => {
      if (!courseExists.rows[0]) {
        return Promise.reject({
          status: 404,
          message: `Course ${courseID} doesn't exist`,
        });
      }

      const { role } = courseRole.rows[0];

      if (courseData.rows[0].active === false) {
        return Promise.reject({
          status: 400,
          message: "This course has been removed",
        });
      }

      const compiledCourseData = {
        id: courseData.rows[0].id,
        name: courseData.rows[0].name,
        description: courseData.rows[0].description,
        course_code: courseData.rows[0].course_code,
        created_at: courseData.rows[0].created_at,
        owner_name: courseData.rows[0].owner_name,
        userID,
        role,
        join_date: courseJoinDate.rows[0]?.join_date || null,
        archived: courseData.rows[0].archived,
        active: courseData.rows[0].active,
        analytics: {
          user_count: parseInt(courseData.rows[0].user_count),
          total_posts: parseInt(courseData.rows[0].total_posts),
          total_comments: parseInt(courseData.rows[0].total_comments),
          num_unresolved_posts: parseInt(
            courseData.rows[0].num_unresolved_posts
          ),
          num_resolved_posts: parseInt(courseData.rows[0].num_resolved_posts),
          num_unread_posts: parseInt(
            courseData.rows[0].total_posts - coursePostViews.length
          ),
        },
        secrets: {
          student_access_code: courseData.rows[0].student_access_code,
          instructor_access_code: courseData.rows[0].instructor_access_code,
        },
        users: courseUsers,
        tags: courseTags.rows,
        posts: coursePosts.map((post) => ({
          ...post,
          // subtract 1 to ignore user's own post view (will always be there)
          views: parseInt(post.views) - 1,
          editable: editable(role, post.role, userID, post.author_id),
          pinnable: pinnable(role),
          viewed:
            coursePostViews.filter((postView) => postView.post_id === post.id)
              .length > 0,
          tags: coursePostTags.rows
            .filter((postTag) => postTag.post_id === post.id)
            .map((tag) => {
              delete tag.post_id;
              return tag;
            }),
          edits: coursePostEdits
            .filter((postEdit) => postEdit.post_id === post.id)
            .map((postEdit) => {
              delete postEdit.post_id;
              return postEdit;
            }),
          comments: courseComments.rows
            .filter((comment) => comment.post_id === post.id)
            .map((comment) => ({
              ...comment,
              score: parseInt(comment.score),
              editable: editable(role, comment.role, userID, comment.author_id),
              endorsable: endorsable(role),
              liked:
                commentLikes.rows.filter(
                  (like) => like.comment_id === comment.id
                ).length > 0,
              edits: courseCommentEdits
                .filter((commentEdit) => commentEdit.comment_id === comment.id)
                .map((commentEdit) => {
                  delete commentEdit.comment_id;
                  return commentEdit;
                }),
              endorsements: commentEndorsements.rows.filter(
                (endorsement) => endorsement.comment_id === comment.id
              ),
              replies: courseCommentReplies.rows
                .filter((reply) => reply.parent_id === comment.id)
                .map((reply) => ({
                  ...reply,
                  score: parseInt(reply.score),
                  editable: editable(role, reply.role, userID, reply.author_id),
                  endorsable: endorsable(role),
                  liked:
                    commentLikes.rows.filter(
                      (like) => like.comment_id === reply.id
                    ).length > 0,
                  edits: courseCommentEdits
                    .filter(
                      (commentEdit) => commentEdit.comment_id === reply.id
                    )
                    .map((commentEdit) => {
                      delete commentEdit.comment_id;
                      return commentEdit;
                    }),
                  endorsements: commentEndorsements.rows.filter(
                    (endorsement) => endorsement.comment_id === reply.id
                  ),
                })),
            })),
        })),
      };

      if (role === "student") {
        // Remove secrets & names from posts/comments/replies marked as anonymous
        // (unless it's the user's own post/comment/reply)
        delete compiledCourseData.secrets;
        compiledCourseData.posts = compiledCourseData.posts.map((post) => {
          if (post.anonymous && post.author_id !== userID) {
            post = anonymize(post);
          }
          post.comments = post.comments.map((comment) => {
            if (comment.anonymous && comment.author_id !== userID) {
              comment = anonymize(comment);
            }
            comment.replies = comment.replies.map((reply) => {
              if (reply.anonymous && reply.author_id !== userID) {
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
  delete obj.author_id;
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
  users,
  posts,
  forUser,
  byID,
  byAccessCode,
  enrol,
  unenrol,
  create,
  updateTags,
  updateName,
  updateDescription,
  archive,
  updateRole,
  setAccessCodes,
  remove,
  updateCourseCode,
};
