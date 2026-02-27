import express from "express";
import router from './routes/notes.js';
import mongoose from 'mongoose';
import postsRouter from "./routes/posts.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// koneksi MongoDB dengan await
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://fegeirfan_db_user:Cikarang123@cluster0.fnk9fp9.mongodb.net/?appName=Cluster0', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('Database connected!');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

// rute
app.use("/posts", postsRouter);
app.use("/notes", router);

// endpoint lain
app.get("/", (req, res) => {
  res.send("Hello irfan!!!");
});

app.get("/gogo", (req, res) => {
  res.send("Hello gogo!!!");
});

app.get("/error", (req, res, next) => {
  const err = new Error("Not Authorized");
  err.status = 401;
  next(err);
}); 

app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err.message || "Server Error");
});

// mulai server setelah koneksi MongoDB berhasil
const startServer = async () => {
  await connectDB();
  app.listen(3000, () => {
    console.log("Server jalan di port localhost:3000");
  });
};

startServer();
