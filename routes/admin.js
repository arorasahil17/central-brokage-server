import express from "express";
const api = express.Router();
import {
  adminAuthenticate,
  adminLogin,
  adminSign,
} from "../controller/admin.js";
import { adminAuth } from "../middleware/auth.js";

api
  .post("/admin-sign", adminSign)
  .post("/admin-login", adminLogin)
  .get("/admin-auth", adminAuth, adminAuthenticate);

export default api;
