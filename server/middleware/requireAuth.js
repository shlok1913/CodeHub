const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "❌ Authorization token missing" });
  }

  const token = authorization.split(" ")[1];
  console.log(token);

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select("_id");
    next();
  } catch (err) {
    res.status(401).json({ message: "❌ Invalid token" });
  }
};

module.exports = requireAuth;
