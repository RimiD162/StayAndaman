import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", "Not Specified"],
    required: false,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  city: {
    type: String,
    trim: true,
    required: false,
  },
  avatar: {
    type: String, // Base64 data URI
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
