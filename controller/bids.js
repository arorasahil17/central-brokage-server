import { asyncHandler } from "../middleware/error.js";
import Bids from "../model/bids.js";
import nodemailer from "nodemailer";
import Loads from "../model/loads.js";
import Users from "../model/user.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const makeBid = asyncHandler(async (req, res, next) => {
  const { loadId } = req.query;
  const userId = req.userId;
  const { bidAmount } = req.body;
  const load = await Loads.findById(loadId);
  const user = await Users.findById(userId);
  let newBid = new Bids({
    loadId,
    userId,
    bidAmount,
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "plotey88@gmail.com",
    subject: "New Bid Placed!",
    text: `A New Bid has been placed on your Load! For Load:\n Pickup:${load.pickUpLocation}\nDropoff:${load.dropOffLocation}\nPickup Date:${load.pickUpData}\n Price:${load.price}\n Weight:${load.weight}\n\n The amount of the bid is ${bidAmount}\nPlease response back to the user.`,
  };
  const userMail = {
    from: process.env.EMAIL_USER,
    to: `${user?.email}`,
    subject: "Your New Bid!",
    text: `Hello ${user.name}\nYour bids request for Load:\n Pickup:${load.pickUpLocation}\nDropoff:${load.dropOffLocation}\nPickup Date:${load.pickUpData}\n Price:${load.price}\n Weight:${load.weight}\n Has been submitted successfully. You will all updates regarding the bid throught email or check your profile on our website.`,
  };
  await transporter.sendMail(mailOptions);
  await transporter.sendMail(userMail);
  await newBid.save();
  const bids = await Bids.find({});
  res.status(200).json({
    status: true,
    message:
      "Bid amount placed successfully! You will be notify soon about the Bid",
    bids,
  });
});

const fetchBids = asyncHandler(async (req, res, next) => {
  try {
    const bids = await Bids.find().populate("loadId").populate("userId");
    if (!bids) {
      res.status(404).json({ status: false, message: "No bids found" });
      return;
    }
    res.status(200).json({ status: true, bidDetails: bids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
});

const updateBid = asyncHandler(async (req, res, next) => {
  const { bidId } = req.params;
  const { bidStatus } = req.body;
  const bid = await Bids.findById(bidId);
  bid.bidStatus = bidStatus;
  console.log(bid);
  const loadId = bid.loadId;
  const userId = bid.userId;
  const load = await Loads.findById(loadId);
  const user = await Users.findById(userId);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Update on your Bid!",
    text: `Dear ${user.name}\n Your Bid Request for Load from ${load.pickUpLocation} to ${load.dropOffLocation} on date ${load.pickUpDate} has been accepted. We will contact you soon for further process.`,
  };
  const updatedBid = await bid.save();
  await transporter.sendMail(mailOptions);
  res.status(200).json({ status: true, updatedBid });
});

const deleteBid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deleted = await Bids.deleteOne({ _id: id });
  res.status(200).json({ status: true, message: "Bid Deleted" });
});

export { makeBid, fetchBids, updateBid, deleteBid };
