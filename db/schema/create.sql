DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS comment_endorsements CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS avatars CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS enrolments CASCADE;

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "first_name" varchar,
  "last_name" varchar,
  "email" varchar,
  "email_visible" boolean DEFAULT false,
  "password" varchar,
  "avatar_id" int,
  "created_at" timestamp DEFAULT (now()),
  "dark_mode" boolean DEFAULT true,
  "bio" varchar,
  "slack_username" varchar,
  "github_username" varchar,
  "discord_id" varchar,
  "linkedin_url" varchar,
  "website_url" varchar
);

CREATE TABLE "posts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "course_id" int,
  "title" varchar,
  "body" varchar,
  "created_at" timestamp DEFAULT (now()),
  "last_modified" timestamp DEFAULT (now()),
  "best_answer" int DEFAULT null,
  "anonymous" boolean DEFAULT false,
  "active" boolean DEFAULT true,
  "pinned" boolean DEFAULT false,
  "views" int
);

CREATE TABLE "comments" (
  "id" SERIAL PRIMARY KEY,
  "post_id" int,
  "parent_id" int,
  "user_id" int,
  "body" varchar,
  "created_at" timestamp DEFAULT (now()),
  "last_modified" timestamp DEFAULT (now()),
  "anonymous" boolean DEFAULT false,
  "active" boolean DEFAULT true
);

CREATE TABLE "comment_endorsements" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "comment_id" int
);

CREATE TABLE "comment_likes" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "comment_id" int
);

CREATE TABLE "permissions" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar
);

CREATE TABLE "tags" (
  "id" SERIAL PRIMARY KEY,
  "course_id" int,
  "name" varchar
);

CREATE TABLE "post_tags" (
  "id" SERIAL PRIMARY KEY,
  "tag_id" int,
  "post_id" int
);

CREATE TABLE "bookmarks" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "post_id" int,
  "last_visited" timestamp DEFAULT (now())
);

CREATE TABLE "avatars" (
  "id" SERIAL PRIMARY KEY,
  "url" varchar
);

CREATE TABLE "courses" (
  "id" SERIAL PRIMARY KEY,
  "creator_id" int,
  "name" varchar,
  "description" varchar,
  "student_access_code" varchar UNIQUE,
  "instructor_access_code" varchar UNIQUE,
  "archived" boolean DEFAULT false,
  "active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "enrolments" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "course_id" int,
  "permissions_id" int,
  "banned" boolean DEFAULT false,
  "enrolled" boolean DEFAULT true
);

ALTER TABLE "users" ADD FOREIGN KEY ("avatar_id") REFERENCES "avatars" ("id");

ALTER TABLE "posts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "posts" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id");

ALTER TABLE "posts" ADD FOREIGN KEY ("best_answer") REFERENCES "comments" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("parent_id") REFERENCES "comments" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "comment_endorsements" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "comment_endorsements" ADD FOREIGN KEY ("comment_id") REFERENCES "comments" ("id");

ALTER TABLE "comment_likes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "comment_likes" ADD FOREIGN KEY ("comment_id") REFERENCES "comments" ("id");

ALTER TABLE "tags" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id");

ALTER TABLE "post_tags" ADD FOREIGN KEY ("tag_id") REFERENCES "tags" ("id");

ALTER TABLE "post_tags" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "bookmarks" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "bookmarks" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "courses" ADD FOREIGN KEY ("creator_id") REFERENCES "users" ("id");

ALTER TABLE "enrolments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "enrolments" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id");

ALTER TABLE "enrolments" ADD FOREIGN KEY ("permissions_id") REFERENCES "permissions" ("id");
