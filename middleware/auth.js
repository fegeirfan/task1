import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  // Ambil token dari header "Authorization: Bearer <token>"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  // Verifikasi token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Simpan data user ke req untuk digunakan di route selanjutnya
    req.user = user;
    next();
  });
}
