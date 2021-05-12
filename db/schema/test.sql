WITH user_id AS (
  SELECT user_id FROM comments WHERE id = 3
)
SELECT 
  CASE WHEN (SELECT is_admin FROM users WHERE id = (SELECT * FROM user_id)) = TRUE THEN 'admin'
  ELSE (
    SELECT role
    FROM enrolments
    JOIN posts ON posts.course_id = enrolments.course_id
    JOIN comments ON comments.post_id = posts.id
    WHERE comments.id = 3
    AND enrolments.user_id = comments.user_id
  )
END AS role

-- SELECT role
--     FROM enrolments
--     JOIN posts ON posts.course_id = enrolments.course_id
--     JOIN comments ON comments.post_id = posts.id
--     WHERE comments.id = 1
--     AND enrolments.user_id = comments.user_id

-- SELECT * FROM comments WHERE id = 1;