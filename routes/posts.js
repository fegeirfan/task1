import express from "express";
import { Post } from "../models/index.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const newPost = await Post.create({ title, content, author });
    console.log("Post created:", newPost);
    res.status(201).json(req.body);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { content, author } = req.body;
    const updateData = { content };
    if (author) updateData.author = author;
    const updated = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
