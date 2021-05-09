Development server: `139.177.195.214`

Run dev server locally: `npm start`
Run test server locally: `npm run test:server`

---

# Routes

## **Debug**

### `GET /api/debug/reset_db`

Resets and reseeds the database.

---

## **Users**

### `POST /api/register`

Creates a new user account.

Request object:

```js
  {
    token: string, // JWT
    firstName: string, // user's first name
    lastName: string, // user's last name
    email: string, // user's email
    password: string, // user's password
  }
```

Requirements:

1. email address must not be taken

Response object:

```js
  {
    token: string, // JWT
    email: string, // user's email
    firstName: string, // user's first name
    lastName: string, // user's last name
    avatarId: string, // user's avatar id
  }
```

---

### `POST /api/login`

Logs in to an existing user.

Request object:

```js
  {
    token: string, // JWT
    email: string, // user's email
    password: string, // user's password
  }
```

Response object:

```js
  {
    token: string, // JWT
    email: string, // user's email
    firstName: string, // user's first name
    lastName: string, // user's last name
    avatarId: string, // user's avatar id
  }
```

---

## **User Courses**

### `POST /api/join`

Enrols a user in a course.

Request object:

```js
{
  token: string, // JWT
  accessCode: string, // the instructor or student access code for the course
}
```

Requirements:

1. user must be logged in
2. access code must exist & course must be active

Response object:

```js
{
  redirect_to: "/courses/:id", // URL for the new course
}
```

---

### `POST /api/create`

Creates a new course.

Request object:

```js
  {
    token: string, // JWT
    name: string, // new course name
    description: string, // new course description (optional)
  }
```

Requirements:

1. user must be logged in

Response object:

```js
{
  redirect_to: "/courses/:id"; // URL for the new course
}
```

---

## Courses

### `GET /api/courses`

Get all courses for the user.

Request object:

```js
{
  token: string, // JWT
}
```

Response object:

```js
[
  {
    id: number, // course id
    name: string, // course name
    created_at: date, // course creation timestamp
    archived: boolean, // course archival status
    role: string, // the user's role within the course
  },
];
```

---

### `GET /api/courses/:id`

Get data for a specific course.

Request object:

```js
  {
    token: string, // JWT
  }
```

Requirements:

1. user must be logged in
2. user must be enrolled in the course as a student, instructor, or owner, or be an admin

Response object:

```js
  {
    id: number, // course id
    name: string, // course name
    description: string, // course description
    archived: string, // course archival status
    analytics: {
      user_count: number, // total users enrolled
      total_posts: number,
      total_comments: number,
      num_unresolved_questions: number, // questions with no 'best_answer'
      num_resolved_questions: number,
    },
    tags: [
      {
        id: number, // tag id
        name: string, // tag name/label
      }
    ],
    posts: [
      {
        id: number, // post id
        title: string,
        body: string,
        bookmarked: boolean,
        created_at: timestamp,
        last_modifited: timestamp,
        best_answer: number, // comment_id of the 'best_answer'
        author_first_name: string, // undefined if post is marked as anonymous and user is not privileged
        author_last_name: string, // undefined if post is marked as anonymous and user is not privileged
        author_avatar_id: number, // '1' if post is marked as anonymous and user is not privileged
        pinned: boolean,
        views: int, // TODO: total number of times post has been viewed
        anonymous: boolean, // if poster has request anonymity
        role: string, // role of the poster (student/instructor/owner/admin)
        user_id: number,
        editable: boolean, // whether current user has edit permission on this post
        tags: [
          {
            id: number,
            name: string,
          }
        ],
        comments: [
          {
            id: number,
            post_id: number,
            anonymous: boolean,
            author_first_name: string,
            author_last_name: string,
            author_avatar_id: number,
            body: string,
            score: number,
            created_at: timestamp,
            last_modified: timestamp,
            endorsements: [
              {
                id: number,
                user_id: number,
                endorser_name: string,
                comment_id: number
              }
            ],
            role: string,
            user_id: number,
            editable: boolean,
            endorsable: boolean,
            replies: [
              {
                id: number,
                parent_id: number,
                anonymous: boolean,
                author_first_name: string,
                author_last_name: string,
                author_avatar_id: number,
                body: string,
                score: number,
                created_at: timestamp,
                last_modified: timestamp,
                endorsements: [
                  {
                    id: number,
                    user_id: number,
                    endorser_name: string,
                    comment_id: number
                  }
                ],
                role: string,
                user_id: number,
                editable: boolean,
                endorsable: boolean,
              }
            ]
          }
        ]
      }
    ]
  }
```

---

## Bookmarks

### `POST /api/bookmarks`

Add a post to the user's bookmarks.

Request object:

```js
  {
    token: string, // JWT
    postId: number, // post id to bookmark
  }
```

---

### `DELETE /api/bookmarks`

Remove a post from the user's bookmarks.

Request object:

```js
  {
    token: string, // JWT
    postId: number, // post id to bookmark
  }
```

---

## Posts

### `POST /api/posts`

Add a new post.

Request object:

```js
  {
    token: string, // JWT
    courseId: number, // course id to post in
    title: string,
    body: string,
    anonymous: boolean, // optional: default false
  }
```

Requirements:

1. user has permission to post in this course

Return object is the newly created post object:

```js
{
  id: number,
  user_id: number,
  course_id: number,
  title: string,
  body: string,
  created_at: timestamp,
  last_modified: timestamp,
  best_answer: number, // nullable
  anonymous: boolean,
  active: boolean,
}
```

---

### `PATCH /api/posts/:id`

Edit a post.

Request object:

```js
  {
    token: string, // JWT
    title: string, // optional - will update last_modified
    body: string, // optional - will update last_modified
    best_answer: number, // optional
    anonymous: boolean, // optional
    pinned: boolean, // optional
  }
```

Requirements:

1. user has edit access on the post

Response object is the updated post:

```js
  {
    id: number,
    user_id: number,
    course_id: number,
    title: string,
    body: string,
    created_at: timestamp,
    last_modified: timestamp,
    best_answer: number, // nullable
    anonymous: boolean,
    active: boolean,
    pinned: boolean,
    views: boolean,
  }
```

---

### `DELETE /api/posts/:id`

Delete a post.

Request object:

```js
  {
    token: string, // JWT
  }
```

---

## Comments

### `POST /api/comments`

Add a comment to a post.

Request object:

```js
  {
    token: string, // JWT
    postId: number,
    body: string,
    parentId: number, // optional, if reply
    anonymous: boolean, // optional
  }
```

Requirements:

1. user has right to post comments on the post

Response object is new comment object:

```js
  {
    id: number,
    post_id: number,
    parent_id: number, // nullable
    user_id: number,
    body: string,
    created_at: timestamp,
    last_modified: timestamp,
    anonymous: boolean,
    active: boolean,
  }
```

---

### `PATCH /api/comments/:id`

Edit a comment of a post.

Request body:

```js
  {
    token: string, // JWT
    body: string, // optional
    anonymous: boolean, // optional
  }
```

Requirements:

1. user has rights to edit this comment

Return object is updated comment object:

```js
  {
    id: number,
    post_id: number,
    parent_id: number, // nullable
    user_id: number,
    body: string,
    created_at: timestamp,
    last_modified: timestamp,
    anonymous: boolean,
    active: boolean,
  }
```

---

### `DELETE /api/comments/:id`

Delete a comment.

Request object:

```js
  {
    token: string, // JWT
  }
```

Requirements:

1. user has rights to edit this comment
