## Routes

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
    firstName: string, // TODO: user's first name
    lastName: string, // TODO: user's last name
    avatarUrl: string, // TODO: user's avatar url
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
    firstName: string, // TODO: user's first name
    lastName: string, // TODO: user's last name
    avatarUrl: string, // TODO: user's avatar url
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
        author_avatar_url: string, // undefined if post is marked as anonymous and user is not privileged
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
            author_avatar_url: string,
            body: string,
            score: number,
            created_at: timestamp,
            last_modified: timestamp,
            endorsed: boolean,
            role: string,
            user_id: number,
            editable: boolean,
            replies: [
              {
                id: number,
                parent_id: number,
                anonymous: boolean,
                author_first_name: string,
                author_last_name: string,
                body: string,
                created_at: timestamp,
                last_modified: timestamp,
                role: string,
                user_id: number,
                editable: boolean,
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

_TODO_

---

### `DELETE /api/bookmarks/:id`

Remove a post from the user's bookmarks.

_TODO_

---

## Posts

### `POST /api/posts`

Add a new post.

_TODO_

---

### `PATCH /api/posts/:id`

Edit a post.

_TODO_

---

### `DELETE /api/posts/:id`

Delete a post.

_TODO_

---

## Comments

### `POST /api/comments`

Add a comment to a post.

_TODO_

---

### `PATCH /comments/:id`

Edit a comment of a post.

_TODO_

---

### `DELETE /comments/:id`

Delete a comment.

_TODO_
