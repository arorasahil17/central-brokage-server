import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: [true, "Email address is required."],
    unique: true,
    validate: {
      validator: function (v) {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address.`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    minlength: [6, "Password must be at least 6 characters long."],
  },
  mcHash: { type: String, required: true },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationOTP: {
    type: String,
  },
  verificationOTPExpiresAt: {
    type: Date,
  },
  contactNumber: { type: Number, required: true, minlength: 10, maxlength: 10 },
  request: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
  bookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bookings",
    },
  ],
  token: String,
  resetPasswordToken: String,
});

const Users = new mongoose.model("User", userSchema);
export default Users;
