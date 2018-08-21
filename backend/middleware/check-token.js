const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, "super_secret_private_key");
    next();
  } catch (error) {
    res.status(401).json({ message: "Token not valid!" });
  }
};
