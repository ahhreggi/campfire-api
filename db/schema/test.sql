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
WHERE posts.course_id = 1;