import express from "express";
import {
  addService,
  getService,
  updateService,
} from "../controller/service.js";

const api = express.Router();

api
  .post("/add-service", addService)
  .put("/update-service/:id", updateService)
  .get("/get-services", getService);

export default api;
