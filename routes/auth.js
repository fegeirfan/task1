import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { sendEmail } from "../utils/mailer.js";

const router = express.Router();


function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex'); 
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return salt + ':' + hash; 
}

// Fungsi verify password
function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return hash === verifyHash;
}
// ... (import tetap sama)

// Tambahkan Route Verify (Taruh sebelum export default)
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    
    // 1. Verifikasi apakah token asli & belum expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Cari user yang memiliki token tersebut
    const user = await User.findOne({ _id: decoded.id, verifyToken: token });

    if (!user) {
      return res.status(400).json({ message: "Token invalid atau sudah digunakan" });
    }

    // 3. Update status user
    user.isVerified = true;
    user.verifyToken = null; // Hapus token setelah dipakai
    await user.save();

    res.status(200).json({ message: "Email berhasil diverifikasi!" });
  } catch (err) {
    res.status(400).json({ message: "Link kedaluwarsa atau tidak valid" });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = hashPassword(password);

    // 1. Buat User baru (isVerified default false dari model)
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // 2. Buat Token Verifikasi (Expired 15 menit)
    const vToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // 3. Simpan token ke database user
    newUser.verifyToken = vToken;
    await newUser.save();

    // 4. Kirim Email dengan Link Verifikasi ke FRONTEND
    const verificationUrl = `http://localhost:5173/verify-email?token=${vToken}`;

    await sendEmail({
      to: email,
      subject: "Verifikasi Akun Kamu",
      html: `
        <h2>Hi ${username}</h2>
        <p>Klik link di bawah ini untuk mengaktifkan akun:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    });

    res.status(201).json({
      message: "Register success. Please check your email to verify.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    const match = verifyPassword(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // buat jwt 
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;