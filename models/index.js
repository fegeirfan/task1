import mongoose from "mongoose";

import PostSchema from "./schema/board.js";
import UserSchema from "./schema/user.js";

export const Post = mongoose.model("Post", PostSchema);
export const User = mongoose.model("User", UserSchema);