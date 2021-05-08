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

`/api/courses/:id`: Returns all posts and analytics data for a given course
