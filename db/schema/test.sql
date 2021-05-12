WITH user_id AS (
  SELECT user_id FROM posts WHERE id = 3
)
SELECT 
  CASE WHEN (SELECT is_admin FROM users WHERE id = (SELECT * FROM user_id)) = TRUE THEN 'admin'
  ELSE (
    SELECT role
    FROM enrolments
    JOIN posts ON posts.course_id = enrolments.course_id
    WHERE posts.id = 3
    AND enrolments.user_id = posts.user_id
  )
END AS role