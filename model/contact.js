import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
});

const Contact = new mongoose.model("Contact", contactSchema);

export default Contact;
