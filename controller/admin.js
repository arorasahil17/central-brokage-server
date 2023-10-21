import { asyncHandler } from "../middleware/error.js";
import Admin from "../model/admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const adminSign = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const error = new Error("Please enter username and password");
    return next(error);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  let admin = new Admin({
    username: username,
    password: hashedPassword,
  });
  const savedAdmin = await admin.save();
  res.status(200).json({ status: true, savedAdmin });
});

const adminLogin = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  const isMatched = await bcrypt.compare(password, admin.password);
  if (!isMatched) {
    const error = new Error("Incorrect Password");
    return next(error);
  }
  //create token
  const token = await jwt.sign({ admin: admin._id }, process.env.JWT_SECRET);
  admin.token = token;
  await admin.save();
  res
    .cookie("adminToken", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 10000),
    })
    .status(200)
    .json({ status: true, message: "Login Successfull", admin: admin });
});

const adminAuthenticate = asyncHandler(async (req, res, nex) => {
  const id = req.adminId;
  const admin = await Admin.findById(id);
  res.status(200).json({ status: true, admin });
});

export { adminSign, adminLogin, adminAuthenticate };
