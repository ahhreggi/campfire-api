  SELECT 
      id, 
      title, 
      body, 
      EXISTS (SELECT * FROM bookmarks WHERE post_id = posts.id AND user_id = 1) AS bookmarked,
      created_at,
      last_modified,
      best_answer,
      (SELECT first_name FROM users WHERE id = posts.user_id) AS author_first_name,
      (SELECT last_name FROM users WHERE id = posts.user_id) AS author_last_name,
      (SELECT url FROM avatars WHERE avatars.id = (SELECT avatar_id FROM users WHERE users.id = 1)) AS author_avatar_url,
      pinned,
      views,
      anonymous,
      CASE  
        WHEN (SELECT is_admin FROM users WHERE id = posts.user_id) = TRUE THEN 'admin'
        ELSE (SELECT role FROM enrolments WHERE user_id = posts.user_id AND course_id = 1) 
      END AS role,
      user_id
    FROM posts
    WHERE course_id = 1;