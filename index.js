
import express from "express";
const app = express();

app.use((req, res, next) => {
  const eror = true;

  if (!eror) {
    const err = new Error("Not Authorized");
    err.status = 401; 
    return next(err);
  }

  next();
});

app.get('/', (req, res) => {
  res.send('Hello irfan!!!');
});
app.get('/gogo', (req, res) => {
  res.send('Hello gogo!!!');
});
app.use((err, req, res, next) => {
  res.status(500).send('Error');
});

app.listen(3000, () => {
  console.log('Server jalan di port 3000');
});