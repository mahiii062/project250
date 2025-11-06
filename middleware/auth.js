// middleware/auth.js (ESM)
import jwt from "jsonwebtoken";

export function requireCustomerJWT(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [scheme, token] = auth.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET); // throws on invalid/expired
    // normalize; your tokens use { customer_id, email }
    req.customer_id = payload.customer_id;
    req.customer_email = payload.email;

    if (!req.customer_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
