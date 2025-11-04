// middleware/auth.js
import jwt from "jsonwebtoken";

export function requireCustomerJWT(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ ok:false, error:"Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // token should encode { customer_id, email, ... }
    req.customer_id = decoded.customer_id;
    next();
  } catch (e) {
    return res.status(401).json({ ok:false, error:"Unauthorized: " + e.message });
  }
}
