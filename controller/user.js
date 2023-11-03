import { asyncHandler } from "../middleware/error.js";
import Users from "../model/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secureConnection: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const fetchUsers = asyncHandler(async (req, res, next) => {
  let users = await Users.find({}, { password: 0, token: 0, __v: 0 });
  res.status(201).json({ status: true, users });
});

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, contactNumber, password, mcHash } = req.body;
  if (!name || !email || !contactNumber || !password) {
    const error = new Error("All details are required!");
    error.statusCode = 400;
    next(error);
  }
  const existingUser = await Users.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exist with this email");
    error.statusCode = 400;
    next(error);
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
  let user = new Users({
    name,
    email,
    contactNumber,
    password: hashedPassword,
    verificationOTP: otp,
    mcHash,
    verificationOTPExpiresAt: otpExpiration,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verification OTP for your account at Central Brokage",
    html: `<p>Your OTP for registration is: <strong>${otp}</strong></p>`,
  };
  await transporter.sendMail(mailOptions);

  const savedUser = await user.save();
  res
    .status(201)
    .json({ status: true, user: savedUser, message: "Please Verify OTP" });
});

const verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!otp) {
    const err = new Error("Otp is required");
    err.statusCode = 403;
    next(err);
    return;
  }
  const user = await Users.findOne({ email });
  if (!user) {
    const err = new Error("User not found to verify");
    err.statusCode = 400;
    next(err);
  }
  if (
    user.verificationOTP !== otp ||
    user.verificationOTPExpiresAt < Date.now()
  ) {
    const err = new Error("Invalid OTP or OTP has expired.");
    err.statusCode = 400;
    next(err);
    return;
  }
  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpiresAt = undefined;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Signin Request Notification",
    text: `Welcome ${user.name}! Your sign in request notification has been sent successfully.\nOnce we verify you, you can login to our website.`,
  };
  await transporter.sendMail(mailOptions);
  await user.save();
  res.json({
    status: true,
    message:
      "OTP verification successful. Please wait until we verify your account.",
  });
});

const resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  let user = await Users.findOne({ email });
  if (!user) {
    const error = new Error("No such user");
    error.statusCode = 422;
    throw error;
  }
  // Generate a random number for the OTP and send it as an email
  const otp = generateOTP();
  const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
  user.verificationOTP = otp;
  user.verificationOTPExpiresAt = otpExpiration;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Verification OTP for your account at Central Brokage",
    html: `<p>Your OTP for registration is: <strong>${otp}</strong></p>`,
  };
  await transporter.sendMail(mailOptions);
  await user.save();
  res.status(200).json({
    status: true,
    message: "OTP resend successfully. Check your email",
  });
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const err = new Error("Please provide an Email and Password");
    err.statusCode = 400;
    next(err);
    return;
  }
  const user = await Users.findOne({ email });
  if (!user) {
    const err = new Error("A User is not registered with this email address");
    err.statusCode = 403;
    next(err);
    return;
  }
  if (!user.isVerified) {
    const err = new Error("Your account is not verified.Please verify first");
    err.statusCode = 401;
    next(err);
    return;
  }
  if (user.request.toLowerCase() === "pending") {
    const err = new Error(
      "Your account request has not been accepted by admin yet.Please wait until we verify you."
    );
    err.statusCode = 403;
    next(err);
    return;
  }
  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    const err = new Error("Incorrect Password");
    err.statusCode = 403;
    next(err);
    return;
  }
  const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1hr",
  });
  user.token = token;
  const loggedUser = await user.save();
  res
    .cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 10000),
    })
    .status(200)
    .json({ status: true, message: "Login Successfull", user: loggedUser });
});

const checkAuth = asyncHandler(async (req, res, next) => {
  const id = req.userId;
  const user = await Users.findById(id);
  if (!user) {
    const error = new Error("You are not authorized to performe this action");
    error.statusCode = 403;
    next(error);
    return;
  }

  res.status(200).json({ status: true, user });
});

const logoutUser = asyncHandler(async (req, res, next) => {
  const id = req.userId;
  const user = await Users.findById(id);
  user.token = null;
  await user.save();
  res.clearCookie("token");
  res.status(200).json({ status: true, message: "Logout successful" });
});

const updateUserRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = await Users.findByIdAndUpdate(id);
  user.request = status;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Your account request update",
    text: `Hello ${user.name}. Your account is verified now. You can now login to our website.`,
  };
  await transporter.sendMail(mailOptions);
  await user.save();
  res.status(200).json({
    status: true,
    message: "Account Request status has been updated",
    user,
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, contactNumber } = req.body;
  console.log("body", req.body);
  const id = req.userId;
  console.log(id);
  let updatedUser = await Users.findByIdAndUpdate(
    id,
    { $set: { name, email, contactNumber } },
    { runValidator: true },
    { new: true }
  );
  console.log(updatedUser);
  if (!updatedUser) {
    const error = new Error(
      "Something went wroong! Maybe you are not logged in"
    );
    error.statusCode = 400;
    return next(error);
  }
  res
    .status(201)
    .json({ status: true, message: "Details Updated", user: updatedUser });
});

const getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let user = await Users.findById(id).populate("bookings");
  res.status(200).json({ status: true, user });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const id = req.userId;
  let user = await Users.findById(id);
  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatched) {
    const error = new Error("Old password does not match");
    error.statusCode = 403;
    next(error);
    return;
  }
  let hashedNewPass = await bcrypt.hash(newPassword, 8);
  user.password = hashedNewPass;
  await user.save();
  res.status(200).json({ status: true, message: "Password changed!" });
});

const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });
  if (!user) {
    const error = new Error("Something Went Wrong");
    error.statusCode = 500;
    return next(error);
  }
  const randomToken = await jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });
  user.resetPasswordToken = randomToken;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password Token",
    html: `To Reset the password click on the link below. This link is valid for 10 minutes.\nhttps://central-brokage-server.vercel.app/new-password?token=${randomToken}`,
  };
  await transporter.sendMail(mailOptions);
  await user.save();
  res.status(200).json({
    status: true,
    message:
      "We have sent you a link to reset your password on your email! Reset your password through that link",
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  const { newPassword } = req.body;
  if (!newPassword) {
    const error = new Error("Please provide the new password");
    error.statusCode = 400;
    next(error);
  }
  const user = await Users.findOne({ resetPasswordToken: token });
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  await user.save();
  res.status(200).json({
    status: true,
    message: "Password Reset Successfully!",
  });
});

const sendMessage = asyncHandler(async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    next(error);
    return;
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "plotey88@gmail.com",
    subject: `New Message From ${name}`,
    text: `Hello. A new message is recieved from ${name}, email of the user ${email}\nMessage:\n${message}`,
  };
  await transporter.sendMail(mailOptions);
  res.status(200).json({ status: true, message: "Message send successfully" });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  let user = await Users.findByIdAndDelete(id);
  if (!user) {
    const error = new Error(
      "Failed to delete user. Please try again after sometimes."
    );
    error.statusCode = 500;
    next(error);
    return;
  }
  res.status(200).json({ status: true, message: "Deleted User Successfully!" });
});

export {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  checkAuth,
  logoutUser,
  updateUserRequest,
  fetchUsers,
  getUser,
  updateProfile,
  resetPassword,
  forgetPassword,
  changePassword,
  sendMessage,
  deleteUser,
};
