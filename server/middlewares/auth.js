// middlewares/auth.js
import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  const decoded = jwt.decode(token);
  if (!decoded?.sub) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  req.clerkId = decoded.sub;   // ← use `sub`
  next();
};

export default authUser;
