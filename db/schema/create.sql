DROP TYPE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS comment_endorsements CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS post_views CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS enrolments CASCADE;

CREATE TYPE "roles" AS ENUM (
  'student',
  'instructor',
  'owner',
  'admin'
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "first_name" text,
  "last_name" text,
  "email" text UNIQUE,
  "email_visible" boolean DEFAULT false,
  "password" text,
  "is_admin" boolean DEFAULT false,
  "avatar_id" int,
  "created_at" timestamp DEFAULT (now()),
  "dark_mode" boolean DEFAULT true,
  "bio" text,
  "socials" jsonb
);

CREATE TABLE "posts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "course_id" int,
  "title" text,
  "body" text,
  "created_at" timestamp DEFAULT (now()),
  "last_modified" timestamp DEFAULT (now()),
  "best_answer" int DEFAULT null,
  "anonymous" boolean DEFAULT false,
  "active" boolean DEFAULT true,
  "pinned" boolean DEFAULT false,
  "views" int DEFAULT 0
);

CREATE TABLE "comments" (
  "id" SERIAL PRIMARY KEY,
  "post_id" int,
  "parent_id" int,
  "user_id" int,
  "body" text,
  "created_at" timestamp DEFAULT (now()),
  "last_modified" timestamp DEFAULT (now()),
  "anonymous" boolean DEFAULT false,
  "active" boolean DEFAULT true
);

CREATE TABLE "comment_likes" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "comment_id" int,
  UNIQUE ("user_id", "comment_id")
);

CREATE TABLE "tags" (
  "id" SERIAL PRIMARY KEY,
  "course_id" int,
  "name" text
);

CREATE TABLE "post_tags" (
  "id" SERIAL PRIMARY KEY,
  "tag_id" int,
  "post_id" int
);

CREATE TABLE "post_views" (
  "id" SERIAL PRIMARY KEY,
  "post_id" int,
  "user_id" int,
  UNIQUE("post_id", "user_id")
);

CREATE TABLE "bookmarks" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "post_id" int,
  "last_visited" timestamp DEFAULT (now()),
  UNIQUE ("user_id", "post_id")
);

CREATE TABLE "courses" (
  "id" SERIAL PRIMARY KEY,
  "name" text,
  "description" text,
  "course_code" varchar(8),
  "student_access_code" text UNIQUE,
  "instructor_access_code" text UNIQUE,
  "archived" boolean DEFAULT false,
  "active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "enrolments" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "course_id" int,
  "role" roles,
  "banned" boolean DEFAULT false,
  "enrolled" boolean DEFAULT true,
  UNIQUE ("user_id", "course_id")
);

ALTER TABLE "posts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "posts" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id");

ALTER TABLE "posts" ADD FOREIGN KEY ("best_answer") REFERENCES "comments" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("parent_id") REFERENCES "comments" ("id");

ALTER TABLE "comments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "comment_likes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "comment_likes" ADD FOREIGN KEY ("comment_id") REFERENCES "comments" ("id");

ALTER TABLE "tags" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id");

ALTER TABLE "post_tags" ADD FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE;

ALTER TABLE "post_tags" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "post_views" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "post_views" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "bookmarks" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "bookmarks" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "enrolments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "enrolments" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("id");
