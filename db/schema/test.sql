SELECT comments.user_id, course_id
FROM comments
JOIN posts ON posts.id = post_id
WHERE comments.id = 1;