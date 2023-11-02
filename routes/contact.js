import express from "express";
import {
  addContact,
  getContact,
  updateContact,
} from "../controller/contact.js";
const api = express.Router();

api
  .post("/add-contact", addContact)
  .put("/update-contact/:id", updateContact)
  .get("/get-contact", getContact);

export default api;
