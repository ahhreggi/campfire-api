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
WHERE posts.course_id = 1;