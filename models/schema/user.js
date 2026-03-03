import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  
  isVerified: {
    type: Boolean,
    default: false,
  },

  verifyToken: String,
},
  { timestamps: true }
);

export default UserSchema;