import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  try {

    const response = await axios.get("http://python:5000");

    res.json({
      status: "success",
      data: response.data
    });

  } catch (error) {

    res.status(500).json({
      status: "error",
      message: "Python service tidak bisa diakses"
    });

  }
});

export default router;