import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true },
});

const Service = new mongoose.model("Service", serviceSchema);

export default Service;
