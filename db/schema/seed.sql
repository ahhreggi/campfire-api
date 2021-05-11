INSERT INTO users (first_name, last_name, email, password, avatar_id) VALUES
('Ginger', 'May', 'hello1@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 2),
('Sharon', 'Green', 'hello2@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 3),
('Elise', 'Feron', 'hello3@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 4),
('Brooke', 'Marrow', 'hello4@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 5),
('Dean', 'Wintringham', 'hello5@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 6),
('Bill', 'Lucas', 'hello6@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 7),
('Bailey', 'Stevens', 'hello7@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 8),
('Bert', 'Flowers', 'hello8@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 9),
('Gresham', 'Barlow', 'hello9@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 10),
('Shannon', 'Stone', 'hello10@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 11),
('Willard', 'French', 'hello11@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 12),
('Fiona', 'Norris', 'hello12@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 13),
('Tommy', 'Mann', 'hello13@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 14),
('Bonnie', 'Jimenez', 'hello14@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 15),
('Lesley', 'Blake', 'hello15@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 16),
('Jamie', 'Farmer', 'hello16@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 17),
('Kendrick', 'Woolridge', 'hello17@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 18),
('Ferris', 'Kimmons', 'hello18@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 19),
('Megan', 'Twitty', 'hello19@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 20),
('Moira', 'Holmes', 'hello20@campfire.ca', '$2b$10$VKJvOxc/k2TsnOPl.jxQ9.Y4zuRYG90HkfpIy/gj4WDwltaBtYXki', 21);

UPDATE users SET is_admin = TRUE WHERE id = 1;

INSERT INTO courses (name, description, student_access_code, instructor_access_code) VALUES
('JS for Beginners', 'Introduction to core JavaScript concepts', '111111', '222222'),
('Raucous Ruby', 'Introduction to core Ruby concepts', '333333', '444444'),
('Everything HTML', 'Divs, headers, imgs - we''ll learn it all', '555555', '666666');

INSERT INTO enrolments (user_id, course_id, role) VALUES
(2, 1, 'owner'),
(3, 2, 'owner'),
(4, 3, 'owner'),
(5, 1, 'instructor'),
(6, 2, 'instructor'),
(7, 3, 'instructor'),
(8, 3, 'instructor'),
(9, 1, 'student'),
(10, 1, 'student'),
(11, 1, 'student'),
(12, 1, 'student'),
(13, 2, 'student'),
(14, 2, 'student'),
(15, 2, 'student'),
(16, 2, 'student'),
(17, 3, 'student'),
(18, 3, 'student'),
(19, 3, 'student'),
(20, 3, 'student');

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
(2, 'Controllers'),
(3, 'iframe'),
(3, 'Browser'),
(3, 'DOM'),
(3, 'HTML5'),
(3, 'Meta');

INSERT INTO posts (user_id, course_id, title, body) VALUES
(9, 1, 'How do I use promises?', 'I am using a new library that returns a Promise instead of a callback... how do I act on it once its done?'),
(10, 1, 'How do I create a class?', 'How do I write a new class in javascript, and declare methods, variables, etc?'),
(7, 2, 'How do I write a function in Ruby?', 'I am used to JS syntax, how do I write a ruby function?'),
(8, 2, 'What is a block and how does it work?', 'I see the array each method can take in a block, what is that?');


INSERT INTO post_tags (tag_id, post_id) VALUES
(3, 1),
(4, 2),
(6, 4);

INSERT INTO comments (post_id, parent_id, user_id, body) VALUES
(1, null, 10, 'I had the same question!'),
(1, null, 11, 'You can consume a promise by calling .then() on it! Be sure to use .catch() as well in case of errors.'),
(3, null, 6, 'Ruby functions are declared using the ''def'' keyword, and finish with the end keyword. '),
(1, 2, 9, 'Thanks for this!!'),
(2, null, 5, 'You create a class like so: class Animal { }. See the documentation for more info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes'),
(1, null, 2, 'Note promises can be chained with multiple .then() calls. Be sure to check out Promise.resolve and Promise.reject as well.'),
(4, null, 13, 'I think it works similar to a callback in JS... can anyone confirm?'),
(4, null, 14, 'Yes it is similar to a callback. It is a chunk of code that can be executed within another function that uses ''yield''');

UPDATE comments SET anonymous = true WHERE id = 1;
UPDATE posts SET best_answer = 2 WHERE id = 1;

INSERT INTO comment_likes (user_id, comment_id) VALUES
(5, 2),
(10, 2),
(10, 5),
(6, 8),
(13, 8);