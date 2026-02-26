import express from "express";
import router from './routes/notes.js';
import mongoose from 'mongoose';
import postsRouter from "./routes/posts.js";

const app = express();
app.use(express.json());

// koneksi MongoDB
mongoose.connect('mongodb://localhost:27017/')
  .then(() => { console.log('Database connected!'); })
  .catch((err) => { console.error('Database connection error:', err); });

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

app.listen(3000, () => {
  console.log("Server jalan di port localhost:3000");
});
