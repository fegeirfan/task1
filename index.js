import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello irfan!!!");
});

app.get("/gogo", (req, res) => {
  res.send("Hello gogo!!!");
});

// 🔥 rute yang sengaja error
app.get("/error", (req, res, next) => {
  const err = new Error("Not Authorized");
  err.status = 401;
  next(err);
});

// error handler (WAJIB di paling bawah)
app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .send(err.message || "Server Error");
});

app.listen(3000, () => {
  console.log("Server jalan di port 3000");
});