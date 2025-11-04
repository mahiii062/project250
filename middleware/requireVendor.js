import jwt from "jsonwebtoken";

export default function requireVendor(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.vendor_id) return res.status(403).json({ ok: false, error: "Not a vendor" });

    req.vendor_id = Number(payload.vendor_id);
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
}
