import Bookings from "../model/booking.js";
import { asyncHandler } from "../middleware/error.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Users from "../model/user.js";
import Loads from "../model/loads.js";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const makeBooking = asyncHandler(async (req, res, next) => {
  const { loadId } = req.body;
  const userId = req.userId;
  if (!loadId || !userId) {
    const error = new Error("Details are required");
    error.statusCode = 400;
    return next(error);
  }
  const user = await Users.findById(userId);
  const load = await Loads.findById(loadId);
  if (load.isBooked) {
    const error = new Error("Load is already booked");
    error.statusCode = 403;
    next(error);
    return;
  }
  let booking = new Bookings({
    loadId,
    userId,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "sahilbhuddi232@gmail.com",
    subject: "New Load Requested!",
    text: `A new request has been made.\nUser Details: Name ${user.name} Contact ${user.contactNumber} Email ${user.email} :\nLoad Details: Pickup ${load.pickUpLocation}, Drop: ${load.dropOffLocation}, Pickup Date: ${load.pickUpDate}, Drop Date: ${load.dropOffDate}, Price: ${load.price}`,
  };

  const userOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Load Request Notification!",
    text: `Thank You ${user.name}.\n We have recieved your booking request for load: Pickup ${load.pickUpLocation}, Drop: ${load.dropOffLocation}, Pickup Date: ${load.pickUpDate}, Drop Date: ${load.dropOffDate}, Price: ${load.price}\nWe Will notify you soon about your booking updates!`,
  };

  await transporter.sendMail(mailOptions);
  await transporter.sendMail(userOptions);
  user.bookings.push(booking);
  load.isBooked = true;
  await load.save();
  await user.save();
  const savedBooking = await booking.save();
  res.status(201).json({
    status: true,
    message: "We have recieved your booking request",
    booking: savedBooking,
  });
});

const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const booking = await Bookings.findById(id);
  if (booking.status.toLowerCase() === status.toLowerCase()) {
    const error = new Error(`The status is already ${status}`);
    error.statusCode = 400;
    return next(error);
  }
  if (status.toLowerCase() === "canceled") {
    load.isBooked = false;
  }

  booking.status = status;
  const userId = booking.userId;
  const loadId = booking.loadId;
  const user = await Users.findById(userId);
  const load = await Loads.findById(loadId);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Load Status Update Notification!",
    text: `Dear ${user.name}.\nYour Loads Request has been ${status} for Load:\nPickup:${load.pickUpLocation}\nDropoff:${load.dropOffLocation}\nPickup Date: ${load.pickUpDate}\nDrop Date: ${load.dropOffDate}\nPrice: ${load.price}\n Weight: ${load.weight}\nFor More details Please visit our website and login to your account.`,
  };
  await transporter.sendMail(mailOptions);
  if (status.toLowerCase() !== "denied") {
    load.isBooked = false;
    await load.save();
  }
  await booking.save();
  res.status(200).json({ status: true, message: "Status Updated!" });
});

const getUserBookings = asyncHandler(async (req, res, next) => {
  const id = req.userId;
  const bookings = await Bookings.find({ userId: id })
    .populate("userId")
    .populate("loadId");
  res.status(200).json({
    status: true,
    data: bookings,
    message: "User bookings retrieved successfully",
  });
});

const cancelBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const booking = await Bookings.findById(id);
  booking.status = "Canceled";
  const user = await Users.findById(booking.userId);
  const load = await Loads.findById(booking.loadId);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Your Load has been Canceled",
    text: `Dear ${user.name}\n\n Your Booking for Load from ${load.pickUpLocation} to ${load.dropOffDate} on date ${load.pickUpDate} has been canceled. Thank you for being a part of our family`,
  };
  await transporter.sendMail(mailOptions);
  await booking.save();
  const bookings = await Bookings.find({ userId: user._id });
  res
    .status(200)
    .json({ status: true, message: "Booking has been canceled", bookings });
});

const fetchBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Bookings.find({})
    .populate("userId")
    .populate("loadId");
  res.status(200).json({ status: true, message: "Fetched Booking", bookings });
});

const deleteBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedBooking = await Bookings.findByIdAndDelete(id);
  req.status(200).json({ status: true, message: "Booking Deleted" });
});

export {
  makeBooking,
  updateBookingStatus,
  getUserBookings,
  cancelBooking,
  fetchBookings,
  deleteBooking,
};
