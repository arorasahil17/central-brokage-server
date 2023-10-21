import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  loadId: { type: mongoose.Schema.Types.ObjectId, ref: "Load", required: true },
  status: {
    type: String,
    enum: [
      "Pending",
      "Accepted",
      "Processing",
      "Completed",
      "Denied",
      "Canceled",
    ],
    default: "Pending",
    required: true,
  },
});

const Bookings = new mongoose.model("Bookings", bookingSchema);

export default Bookings;
