import jwt from "jsonwebtoken";

export function auth(required = true) {
  return (req, res, next) => {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    if (!token)
      return required
        ? res.status(401).json({ error: "Unauthorized" })
        : next();
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
console.log("User role:", req.user.role);

    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
