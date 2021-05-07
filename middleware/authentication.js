const { response } = require("express");
const jwt = require("jsonwebtoken");

const isAuthenticated = function (req, res, next) {
  try {
    // Try to verify/decode the JWT, and append to res.locals if successful
    res.locals.decodedToken = jwt.verify(
      req.body.token,
      process.env.JWT_SECRET_KEY
    );
    next();
  } catch (e) {
    if (e.message === "jwt must be provided") {
      return res.status(401).send({ message: "User has no JWT" });
    } else if (e.message === "invalid token") {
      return res.status(401).send({ message: "User has invalid JWT" });
    } else {
      console.log(e);
      return res.status(401).send({ message: `${e.name}: ${e.message}` });
    }
  }
};

const isNotAuthenticated = function (req, res, next) {};

module.exports = { isAuthenticated };
