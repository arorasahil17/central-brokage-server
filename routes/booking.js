import express from "express";
import {
  cancelBooking,
  deleteBooking,
  fetchBookings,
  getUserBookings,
  makeBooking,
  updateBookingStatus,
} from "../controller/bookins.js";
import { authenticate } from "../middleware/auth.js";

const api = express.Router();

api
  .post("/booking", authenticate, makeBooking)
  .patch("/update-status/:id", updateBookingStatus)
  .get("/user-booking", authenticate, getUserBookings)
  .patch("/cancel-booking/:id", cancelBooking)
  .get("/all-bookings", fetchBookings)
  .delete("/delete-booking/:id", deleteBooking);

export default api;
