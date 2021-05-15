SELECT 
  users.id,
  users.first_name,
  users.last_name,
  users.email,
  users.avatar_id,
  enrolments.role
FROM courses
INNER JOIN enrolments ON courses.id = course_id
INNER JOIN users ON user_id = users.id
WHERE courses.id = 1;