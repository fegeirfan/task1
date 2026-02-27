import mongoose from 'mongoose';

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: String,
  content: String,
  author: String,
}, {
  timestamps: true,
});

export default PostSchema;
