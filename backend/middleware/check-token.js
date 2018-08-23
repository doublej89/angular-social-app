const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "super_secret_private_key");
    req.userData = { email: decoded.email, userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token not valid!" });
  }
};
