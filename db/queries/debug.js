const db = require("../index");
const fs = require("fs").promises;
const path = require("path");

const resetDb = function () {
  const schemaPath = path.join(__dirname, "..", "schema", "create.sql");
  fs.readFile(schemaPath, { encoding: "utf-8" }).then((contents) =>
    db.query(contents).then(() => {
      const seedPath = path.join(__dirname, "..", "schema", "seed.sql");
      fs.readFile(seedPath, { encoding: "utf-8" }).then((contents) =>
        db.query(contents)
      );
    })
  );
};

module.exports = { resetDb };
