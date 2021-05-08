const { editable } = require("./permissionsHelpers");

const ADMIN = "admin";
const OWNER = "owner";
const INSTRUCTOR = "instructor";
const STUDENT = "student";

it("should return true if role is admin", () => {
  const result1 = editable(ADMIN, ADMIN, 1, 2);
  expect(result1).toBeTruthy();

  const result2 = editable(ADMIN, OWNER, 1, 2);
  expect(result2).toBeTruthy();

  const result3 = editable(ADMIN, INSTRUCTOR, 1, 2);
  expect(result3).toBeTruthy();

  const result4 = editable(ADMIN, STUDENT, 1, 2);
  expect(result4).toBeTruthy();
});

it("should return true if its the users own post", () => {
  const result1 = editable(STUDENT, STUDENT, 1, 1);
  expect(result1).toBeTruthy();

  const result2 = editable(INSTRUCTOR, INSTRUCTOR, 1, 1);
  expect(result2).toBeTruthy();

  const result3 = editable(OWNER, OWNER, 1, 1);
  expect(result3).toBeTruthy();

  const result4 = editable(ADMIN, ADMIN, 1, 1);
  expect(result4).toBeTruthy();
});

it("should return true if we have a role equal to or greater than the poster's", () => {
  const result1 = editable(INSTRUCTOR, STUDENT, 1, 2);
  expect(result1).toBeTruthy();

  const result2 = editable(OWNER, INSTRUCTOR, 1, 2);
  expect(result2).toBeTruthy();
});

it("should return false if it's not the users own post, and they have a lower role than the poster's (or are a student)", () => {
  const result1 = editable(STUDENT, STUDENT, 1, 2);
  expect(result1).toBeFalsy();

  const result2 = editable(STUDENT, INSTRUCTOR, 1, 2);
  expect(result2).toBeFalsy();

  const result3 = editable(STUDENT, OWNER, 1, 2);
  expect(result3).toBeFalsy();

  const result4 = editable(STUDENT, ADMIN, 1, 2);
  expect(result4).toBeFalsy();

  const result5 = editable(INSTRUCTOR, OWNER, 1, 2);
  expect(result5).toBeFalsy();

  const result6 = editable(INSTRUCTOR, ADMIN, 1, 2);
  expect(result6).toBeFalsy();

  const result7 = editable(OWNER, ADMIN, 1, 2);
  expect(result7).toBeFalsy();
});
