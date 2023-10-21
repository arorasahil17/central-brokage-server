import jwt from "jsonwebtoken";
import { asyncHandler } from "./error.js";
import dotenv from "dotenv";
dotenv.config();

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    const error = new Error("You are not logged in");
    error.statusCode = 401;
    next(error);
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  if (decoded) {
    req.userId = decoded.userId;
    next();
  }
});

const adminAuth = asyncHandler(async (req, res, next) => {
  const adminToken = req.cookies.adminToken;
  if (!adminToken) {
    const error = new Error("Admin is not logged in");
    error.statusCode = 401;
    next(error);
  }
  const decoded = await jwt.verify(adminToken, process.env.JWT_SECRET);
  if (decoded) {
    req.adminId = decoded.admin;
    next();
  }
});

export { authenticate, adminAuth };
