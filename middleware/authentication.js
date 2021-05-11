const jwt = require("jsonwebtoken");
const { userIsAdmin } = require("../db/queries/users");

const isAuthenticated = function (req, res, next) {
  try {
    // Try to verify/decode the JWT, and append to res.locals if successful
    res.locals.decodedToken = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET_KEY
    );
    next();
  } catch (e) {
    res.status(401).send({ message: `${e.name}: ${e.message}` });
  }
};

const isAdmin = function (req, res, next) {
  const { id } = res.locals.decodedToken;
  userIsAdmin(id).then((admin) => {
    if (admin) next();
    else next({ status: 401, message: "User is not an admin" });
  });
};

module.exports = { isAuthenticated, isAdmin };
