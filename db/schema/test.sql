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
