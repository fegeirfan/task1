import mongoose from 'mongoose';
import PostSchema from './schema/board.js';

export const Post = mongoose.model('Post', PostSchema);
