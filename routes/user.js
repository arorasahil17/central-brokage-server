import express from "express";
const api = express.Router();
import {
  registerUser,
  loginUser,
  verifyOtp,
  checkAuth,
  logoutUser,
  updateUserRequest,
  fetchUsers,
  updateProfile,
  getUser,
  forgetPassword,
  changePassword,
  resetPassword,
  sendMessage,
  resendOtp,
  deleteUser,
} from "../controller/user.js";
import { authenticate } from "../middleware/auth.js";

api
  .post("/sign-up", registerUser)
  .post("/login", loginUser)
  .post("/verify-otp", verifyOtp)
  .post("/resend-otp", resendOtp)
  .get("/check-auth", authenticate, checkAuth)
  .post("/logout", authenticate, logoutUser)
  .patch("/update-user-request/:id", updateUserRequest)
  .get("/users", fetchUsers)
  .put("/update-profile", authenticate, updateProfile)
  .get("/get-user/:id", getUser)
  .post("/forget-password", forgetPassword)
  .post("/change-password", authenticate, changePassword)
  .post("/reset-password", resetPassword)
  .post("/send-message", sendMessage)
  .delete("/delete-user/:id", deleteUser);
export default api;
