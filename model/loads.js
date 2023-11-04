import mongoose from "mongoose";

const loadsSchema = new mongoose.Schema({
  pickUpLocation: { type: String, required: true },
  dropOffLocation: { type: String, required: true },
  pickUpDate: { type: String, required: true },
  dropOffDate: { type: String, required: true },
  pickUpTime: { type: String, required: true },
  dropOffTime: { type: String, required: true },
  totalMiles: { type: Number, required: true },
  weight: { type: Number, required: true },
  price: { type: Number, required: true },
  ratePerMile: { type: Number, required: true },
  equipment: { type: String, required: true },
  eqLength: { type: Number, required: true },
  loadType: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  equipmentRequirement: { type: String, required: true },
  mapLink: { type: String, required: true },
});

const Loads = new mongoose.model("Load", loadsSchema);
export default Loads;
