import express from "express";
import {
  deleteBid,
  fetchBids,
  makeBid,
  updateBid,
} from "../controller/bids.js";
const api = express.Router();
import { authenticate } from "../middleware/auth.js";

api
  .post("/make-bid", authenticate, makeBid)
  .get("/fetch-bids", fetchBids)
  .patch("/update-bid/:bidId", updateBid)
  .delete("/delete-bid/:id", deleteBid);

export default api;
