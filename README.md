## Routes

### Debug

`/api/debug/reset_db`: Reset the db

### User

`/api/register`: Registers a new user

- req.body = { firstName, lastName, email, password }
- response = { token, email }

`/api/login`: Logs a user in

- req.body = { email, password }
- response = { token, email }

### Courses

`/api/courses`: Returns a list of the users courses

- response:

```js
[
  {
    id,
    name,
    created_at,
    archived,
    role,
  },
];
```

`/api/courses/:id`: Returns all posts and analytics data for a given course

- response:

```js
{
  id,
  name,
  description,
  archived,
  analytics: {
    user_count,
    average_response_time, // TODO
    total_posts,
    total_comments,
    num_unresolved_questions, num_resolved_questions
  },
  secrets: {
    // this object is only provided if the req is made by an instructor
    student_access_code,
    instructor_access_code,
  },
  tags: [
    {
      id,
      name,
    }
  ],
  posts: [
    {
      id,
      title
      body,
      bookmarked,
      created_at,
      last_modified,
      best_answer,
      author_first_name, // users.first_name or undefined (if posts.anonymous = true)
      author_last_name, // users.last_name or undefined (if posts.anonymous = true)
      author_avatar_url, // users.avatar_url or undefined (if posts.anonymous = true)
      role, // student/instructor/owner
      user_id,
      editable, // boolean: if current user has permission to edit/delete this
      tags: [
        {
          id,
          name
        }
      ],
      pinned,
      views,
      comments: [
        {
          id,
          anonymous,
          author_first_name,
          author_last_name,
          author_avatar_url,
          body,
          score,
          comment_id,
          created_at,
          last_modified,
          endorsed // boolean (true if there is an entry in the comment_endorsements table for this comment_id)
          role: // student/instructor/owner
          user_id,
          editable, // boolean: if current user has permission to edit/delete this
          replies: [
            {
              id,
              anonymous,
              author_first_name,
              author_last_name,
              author_avatar_url
              body,
              created_at,
              last_modified,
              role // student/instructor/owner
              user_id,
              editable
            }
          ]
        }
      ]
    }
  ]
}

```
