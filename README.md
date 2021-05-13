# Info & Setup

Run dev server locally: `npm start`

Run test server locally: `npm run test:server`

---

# Seed Data

All logins are formatted as `hello{id}@campfire.ca`

### Key users:

1. Admin
2. Owner of 'JS for Beginners' course
3. Owner of 'Raucous Ruby' course
4. Owner of 'Everything HTML' course
5. Instructor for 'JS for Beginners' course
6. Instructor for 'Raucous Ruby' course
7. Instructor for 'Everything HTML' course
8. Instructor for 'Everything HTML' course

9-12: Students in 'JS for Beginners'

13-16: Students in 'Raucous Ruby'

17-20: Students in 'Everything HTML'

---

## **Authorization**

All routes (except login and register) require a valid JSON Web Token to be set in the 'Authorization' header. The token is sent as a response to the login/register routes.

---

# Routes

## **Debug**

### `GET /api/debug/reset_db`

Resets and re-seeds the database.

---

## **Users**

### `POST /api/register`

Creates a new user account.

Request object:

```js
  {
    firstName: string,  // user's first name
    lastName: string,   // user's last name
    email: string,      // user's email
    password: string,   // user's password
  }
```

Requirements:

1. email address must not be taken

Response object:

```js
  {
    token: string,      // JSON Web Token - required for all future requests
    userID: number,     // user's ID
    email: string,      // user's email
    firstName: string,  // user's first name
    lastName: string,   // user's last name
    avatarID: string,   // user's avatar id
  }
```

---

### `POST /api/login`

Logs in to an existing user.

Request object:

```js
  {
    email: string,      // user's email
    password: string,   // user's password
  }
```

Response object:

```js
  {
    token: string,      // JSON Web Token - required for all future requests
    userID: number,     // user's ID
    email: string,      // user's email
    firstName: string,  // user's first name
    lastName: string,   // user's last name
    avatarID: string,   // user's avatar id
  }
```

---

## **User Courses**

### `POST /api/join`

Enrols a user in a course.

Request object:

```js
{
  accessCode: string,   // the instructor or student access code for the course
}
```

Requirements:

1. access code must exist & course must be active

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
    name: string,         // new course name
    description: string,  // new course description (optional)
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

Requirements:

1. user must be enrolled in the course as a student, instructor, or owner, or be an admin

Response object:

```js
  {
    id: number, // course id
    name: string, // course name
    description: string, // course description
    role: string, // user's role in the course
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
        author_id: number,
        author_first_name: string, // undefined if post is marked as anonymous and user is not privileged
        author_last_name: string, // undefined if post is marked as anonymous and user is not privileged
        author_avatar_id: number, // '1' if post is marked as anonymous and user is not privileged
        pinned: boolean,
        views: number, // number of times post has been viewed by a logged-in user
        anonymous: boolean, // if poster has request anonymity
        role: string, // role of the poster (student/instructor/owner/admin)
        editable: boolean, // user permission to edit this post
        pinnable: boolean, // user has permission to pin this post
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
            liked: boolean,
            anonymous: boolean,
            author_id: number,
            author_first_name: string,
            author_last_name: string,
            author_avatar_id: number,
            body: string,
            score: number,
            created_at: timestamp,
            last_modified: timestamp,
            role: string,
            editable: boolean,
            endorsable: boolean,
            endorsements: [
              {
                id: number,
                user_id: number,
                endorser_name: string,
                comment_id: number
              }
            ],
            replies: [
              {
                id: number,
                parent_id: number,
                liked: boolean,
                anonymous: boolean,
                author_id: number,
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
    postID: number, // post id to bookmark
  }
```

---

### `DELETE /api/bookmarks`

Remove a post from the user's bookmarks.

Request object:

```js
  {
    postID: number, // post id to bookmark
  }
```

---

## Posts

### `POST /api/posts`

Add a new post.

Request object:

```js
  {
    courseID: number, // course id to post in
    title: string,
    body: string,
    tags: [id],
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
  best_answer: number,    // nullable
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
    title: string,        // optional - will update last_modified
    body: string,         // optional - will update last_modified
    tags: [id],           // optional
    anonymous: boolean,   // optional
    best_answer: number,  // optional
    pinned: boolean,      // optional
  }
```

Requirements:

1. user has edit access on the post
2. for setting best_answer, user must be post author

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
    views: number,
  }
```

---

### `DELETE /api/posts/:id`

Delete a post.

Requirements:

1. user has rights to edit this post

---

### `POST /api/posts/:id/view`

View a post.

Requirements:

1. user has access to this post

---

## Comments

### `POST /api/comments`

Add a comment to a post.

Request object:

```js
  {
    postID: number,
    body: string,
    parentID: number,   // optional, if reply
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
    body: string,       // optional
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

Requirements:

1. user has rights to edit this comment

---

### `POST /api/comments/:id/like`

Like a comment.

Requirements:

1. user has access to the course the comment is posted in

---

### `POST /api/comments/:id/unlike`

Remove a like from a comment.
