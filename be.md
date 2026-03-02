# Backend Authentication Documentation

## Daftar Isi
- [Overview](#overview)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur File](#struktur-file)
- [API Endpoints](#api-endpoints)
- [Password Hashing](#password-hashing)
- [JWT Token](#jwt-token)
- [Middleware Authentication](#middleware-authentication)
- [Cara Penggunaan](#cara-penggunaan)

---

## Overview

Sistem authentication backend ini menyediakan fitur:
- Registrasi user baru
- Login dengan email & password
- Proteksi route dengan JWT token
- Password hashing dengan SHA-256

---

## Teknologi yang Digunakan

| Teknologi | Kegunaan |
|------------|----------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB (Mongoose) | Database |
| JSON Web Token (JWT) | Token authentication |
| Crypto (Node.js built-in) | Password hashing SHA-256 |

---

## Struktur File

```
├── routes/
│   └── auth.js          # Route untuk register & login
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── models/
│   └── schema/
│       └── user.js      # User schema
└── index.js             # Main server file
```

---

## API Endpoints

### 1. POST /api/auth/register
Registrasi user baru.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Response Success (201):**
```json
{
  "message": "Register success",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Response Error (400):**
```json
{ "message": "All fields required" }
```

**Response Error (409):**
```json
{ "message": "Email already registered" }
```

---

### 2. POST /api/auth/login
Login user dan mendapatkan JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Response Success (200):**
```json
{
  "message": "Login success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."": {
    "id": "507,
  "userf1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Response Error (400):**
```json
{ "message": "Email & password required" }
```

**Response Error (401):**
```json
{ "message": "Invalid credentials" }
```

---

## Password Hashing

### Algoritma
Web app ini menggunakan **SHA-256** dengan PBKDF2 untuk hashing password.

### Implementasi (routes/auth.js)

```javascript
import crypto from "crypto";

function hashPassword(password) {
  // Generate salt acak 16 bytes
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash dengan PBKDF2 - 1000 iterations, SHA-256
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  
  return salt + ':' + hash;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return hash === verifyHash;
}
```

### Format Penyimpanan
Password disimpan dalam format: `salt:hash`
- Salt: 32 karakter (hex)
- Hash: 64 karakter (hex)
- Contoh: `a1b2c3d4e5f6...:f1e2d3c4b5a6...`

---

## JWT Token

### Konfigurasi
- **Algorithm:** HS256
- **Secret Key:** Dari environment variable `JWT_SECRET`
- **Expired:** 1 hari (`1d`)

### Payload Token
```javascript
{
  id: "507f1f77bcf86cd799439011",
  email: "john@example.com"
}
```

### Pembuatan Token (routes/auth.js)
```javascript
const token = jwt.sign(
  {
    id: user._id,
    email: user.email,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);
```

---

## Middleware Authentication

### File: middleware/auth.js

```javascript
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  // Ambil token dari header "Authorization: Bearer <token>"
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
}
```

### Response Error Codes
- **401** - Access token required (token tidak ada)
- **403** - Invalid or expired token (token tidak valid/expired)

---

## Cara Penggunaan

### 1. Setup Environment Variable
Buat file `.env`:
```env
JWT_SECRET=your_super_secret_key_here
MONGO_URI=mongodb://localhost:27017/myweb
PORT=3000
```

### 2. Registrasi User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"mypassword123"}'
```

### 3. Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"mypassword123"}'
```

Simpan token yang didapat dari response login.

### 4. Akses Route Terproteksi
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My Post","content":"Post content here"}'
```

---

## Contoh Penggunaan di Frontend

### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();
localStorage.setItem('token', token);
```

### Akses API Terproteksi
```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ title, content })
});
```

---

## Catatan Keamanan

⚠️ **Peringatan untuk Production:**

1. **SHA-256 vs Bcrypt:** Untuk production, disarankan menggunakan **bcrypt** karena:
   - Bcrypt punya cost factor yang bisa diatur
   - Lebih terbukti keamanannya
   - Lebih lambat secara intentional (mencegah brute force)

2. **JWT Secret:** Gunakan key yang kuat dan simpan di environment variable

3. **HTTPS:** Selalu gunakan HTTPS di production

4. **Password Requirements:** Tambahkan validasi password (min length, complexity)

---

## Update History

| Tanggal | Deskripsi |
|---------|-----------|
| 2026-03-02 | Migrasi dari bcrypt ke SHA-256 |
| 2026-03-02 | Ditambahkan JWT middleware |
