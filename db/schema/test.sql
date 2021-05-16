SELECT post_views.user_id, post_views.post_id
FROM post_views
INNER JOIN posts ON posts.id = post_id
INNER JOIN courses ON courses.id = course_id
WHERE courses.id = 1
AND post_views.user_id = 1;