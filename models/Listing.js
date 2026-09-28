import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Hotel", "Lodge", "Rental"],
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  childPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
    default: "",
  },
  amenities: {
    type: [String],
    default: [],
  },
  image: {
    type: String, // Base64 data URI
    default: "",
  },
  image2: {
    type: String, // Base64 data URI
    default: "",
  },
  image3: {
    type: String, // Base64 data URI
    default: "",
  },
  image4: {
    type: String, // Base64 data URI
    default: "",
  },
  rating: {
    type: Number,
    default: 3,
    min: 1,
    max: 5,
  },
  contact: {
    type: String,
    default: "",
  },
  available: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
