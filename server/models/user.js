import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["VIEWER", "OPERATOR", "TECH", "ADMIN"],
      default: "VIEWER",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
