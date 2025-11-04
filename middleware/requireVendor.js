// middleware/requireVendor.js
import jwt from "jsonwebtoken";

export default function requireVendor(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const [type, token] = hdr.split(" ");
    if (type !== "Bearer" || !token) {
      return res.status(401).json({ ok: false, error: "Missing or invalid Authorization header" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET); // must match vendorAuthRouter
    // Expect payload like: { vendor_id: 123, ... }
    if (!payload?.vendor_id) {
      return res.status(401).json({ ok: false, error: "Invalid token payload" });
    }

    req.vendor_id = payload.vendor_id;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "Unauthorized: " + e.message });
  }
}
