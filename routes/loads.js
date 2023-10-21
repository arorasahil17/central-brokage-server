import express from "express";
const api = express.Router();
import {
  addLoad,
  deleteLoad,
  getLoads,
  updateLoad,
} from "../controller/loads.js";

api
  .post("/load", addLoad)
  .get("/loads", getLoads)
  .delete("/delete-load/:id", deleteLoad)
  .put("/update-load", updateLoad);

export default api;
