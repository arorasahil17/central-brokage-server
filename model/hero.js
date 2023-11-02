import mongoose from "mongoose";

const heroSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true },
});

const Hero = new mongoose.model("Hero", heroSchema);

export default Hero;
