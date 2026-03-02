import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import router from "./routes/notes.js";
import postsRouter from "./routes/posts.js";
import authRouter from "./routes/auth.js";

// =======================
// LOAD ENV
// =======================
dotenv.config();

const app = express();

// =======================
// MIDDLEWARE
// =======================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"], // 👈 PENTING
}));

app.use(express.json());

// =======================
// DATABASE
// =======================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 
      "mongodb+srv://fegeirfan_db_user:Cikarang123@cluster0.fnk9fp9.mongodb.net/?appName=Cluster0",
      {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      }
    );
    console.log("✅ Database connected!");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
};

// =======================
// ROUTES
// =======================
app.use("/auth", authRouter);
app.use("/posts", postsRouter);
app.use("/notes", router);

// =======================
// TEST ROUTES
// =======================
app.get("/", (req, res) => {
  res.send("Hello irfan!!!");
});

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  });
};

startServer();

export default app;