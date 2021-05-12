const handleErrors = (err, req, res, next) => {
  console.log(err);
  const { status, message } = err;
  if (status && message) {
    res.status(status).send({ message });
  } else res.status(500).send({ message: `Unknown error: ${err.message}` });
};

module.exports = { handleErrors };
