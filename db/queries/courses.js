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

const getCourseById = function (id, userId) {
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
      (SELECT COUNT(*) FROM posts WHERE best_answer IS NOT NULL) AS num_resolved_questions,
      (SELECT COUNT(*) FROM posts WHERE best_answer IS NULL) AS num_unresolved_questions,
      student_access_code,
      instructor_access_code
    FROM courses
    WHERE id = $1;
  `,
    [id]
  );

  const courseTagsPromise = db.query(
    `
    SELECT id, name FROM tags
    WHERE course_id = $1;
  `,
    [id]
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
      pinned,
      views
    FROM posts
    WHERE course_id = $1;
  `,
    [id, userId]
  );

  const courseCommentsPromise = db.query(
    `
    SELECT 
      id,
      post_id,
      anonymous,
      (SELECT first_name FROM users WHERE users.id = user_id) AS author_first_name,
      (SELECT last_name FROM users WHERE users.id = user_id) AS author_last_name,
      (SELECT url FROM avatars WHERE avatars.id = (SELECT avatar_id FROM users WHERE users.id = user_id)) AS author_avatar_url,
      body,
      (SELECT COUNT(*) FROM comment_likes WHERE comment_id = comments.id) AS score,
      created_at,
      last_modified,
      EXISTS (SELECT * FROM comment_likes WHERE comment_id = comments.id AND user_id IN (SELECT user_id FROM enrolments WHERE course_id = $1 AND role IN ('instructor', 'owner'))) AS endorsed
    FROM comments
    WHERE post_id in (SELECT id FROM posts WHERE course_id = $1)
  `,
    [id]
  );

  const courseCommentRepliesPromise = db.query(
    `
    SELECT 
      id,
      parent_id,
      anonymous,
      (SELECT first_name FROM users WHERE users.id = user_id) AS author_first_name,
      (SELECT last_name FROM users WHERE users.id = user_id) AS author_last_name,
      body,
      created_at,
      last_modified
    FROM comments
    WHERE parent_id IN (SELECT id FROM comments WHERE post_id IN (SELECT id FROM posts WHERE course_id = $1))
  `,
    [id]
  );

  const coursePostTagsPromise = db.query(
    `
    SELECT tags.id, name, post_id FROM tags
    JOIN post_tags ON tags.id = tag_id
    WHERE course_id = $1;
  `,
    [id]
  );

  Promise.all([
    courseDataPromise,
    courseTagsPromise,
    coursePostsPromise,
    courseCommentsPromise,
    courseCommentRepliesPromise,
    coursePostTagsPromise,
  ]).then((results) => {
    const [
      courseData,
      courseTags,
      coursePosts,
      courseComments,
      courseCommentReplies,
      coursePostTags,
    ] = results;

    const compiledCourseData = {};

    //console.log(courseData.rows[0]);
    // Object.assign(compiledCourseData, courseData.rows[0]);
    // console.log(compiledCourseData);

    // TODO: compile the promise results into the final compiledCourseData object which will be sent to the frontend
  });
};

module.exports = { getCoursesForUser, getCourseById };
