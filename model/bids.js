import mongoose from "mongoose";

const bidsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loadId: { type: mongoose.Schema.Types.ObjectId, ref: "Load", required: true },
  bidAmount: { type: Number, required: true },
  bidStatus: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending",
  },
});

const Bids = new mongoose.model("Bids", bidsSchema);

export default Bids;
