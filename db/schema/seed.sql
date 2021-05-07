INSERT INTO users (first_name, last_name, email, password) VALUES
('Aaron', 'Aldridge', 'hello1@campfire.ca', '$2b$10$oMeyV3ebi66lTAL9hAhQJumGirYQkXBM4aDEc2o5ecQLzVflzgkNa'),
('Becky', 'Black', 'hello2@campfire.ca', '$2b$10$oMeyV3ebi66lTAL9hAhQJumGirYQkXBM4aDEc2o5ecQLzVflzgkNa'),
('Carson', 'Cool', 'hello3@campfire.ca', '$2b$10$oMeyV3ebi66lTAL9hAhQJumGirYQkXBM4aDEc2o5ecQLzVflzgkNa'),
('Donna', 'Derby', 'hello4@campfire.ca', '$2b$10$oMeyV3ebi66lTAL9hAhQJumGirYQkXBM4aDEc2o5ecQLzVflzgkNa'),
('Edward', 'Ecksworth', 'hello5@campfire.ca', '$2b$10$oMeyV3ebi66lTAL9hAhQJumGirYQkXBM4aDEc2o5ecQLzVflzgkNa'),
('Fiona', 'Ford', 'hello6@campfire.ca', '$2b$10$oMeyV3ebi66lTAL9hAhQJumGirYQkXBM4aDEc2o5ecQLzVflzgkNa'),
('Gerald', 'George', 'hello7@campfire.ca', '$2b$10$oMeyV3ebi66lTAL9hAhQJumGirYQkXBM4aDEc2o5ecQLzVflzgkNa'),
('Hannah', 'Herbert', 'hello8@campfire.ca', '$2b$10$oMeyV3ebi66lTAL9hAhQJumGirYQkXBM4aDEc2o5ecQLzVflzgkNa');

INSERT INTO courses (creator_id, name, description, student_access_code, instructor_access_code) VALUES
(1, 'JS for Beginners', 'Introduction to core JavaScript concepts', '111111', '222222'),
(2, 'Raucous Ruby', 'Introduction to core Ruby concepts', '333333', '444444');

INSERT INTO enrolments (user_id, course_id, role) VALUES
(3, 1, 'instructor'),
(4, 2, 'instructor'),
(5, 1, 'student'),
(6, 1, 'student'),
(7, 2, 'student'),
(8, 2, 'student');

INSERT INTO tags (course_id, name) VALUES 
(1, 'Callbacks'),
(1, 'Closures'),
(1, 'Promises'),
(1, 'Classes'),
(1, 'Async'),
(2, 'Blocks'),
(2, 'Classes'),
(2, 'ActiveRecord'),
(2, 'Models'),
(2, 'Views'),
(2, 'Controllers');

INSERT INTO posts (user_id, course_id, title, body) VALUES
(5, 1, 'How do I use a promise?', 'I am using a new library that returns a Promise object instead of a callback... how do I act on it once its done?'),
(6, 1, 'How do I create a class?', 'How do I write a new class in javascript, and declare methods, variables, etc?'),
(7, 2, 'How do I write a function in Ruby?', 'I am used to JS syntax, how do I write a ruby function?'),
(8, 2, 'What is a block and how does it work?', 'I see the array each method can take in a block, what is that?');


INSERT INTO post_tags (tag_id, post_id) VALUES
(3, 1),
(4, 2),
(6, 4);

INSERT INTO comments (post_id, parent_id, user_id, body) VALUES
(1, null, 5, 'I had the same question!'),
(1, null, 6, 'You can consume a promise by calling .then() on it! Be sure to use .catch() as well in case of errors.'),
(3, null, 8, 'Ruby functions are declared using the def keyword, and finish with the end keyword.');

INSERT INTO comment_likes (user_id, comment_id) VALUES
(3, 2),
(5, 2),
(6, 2),
(4, 3);