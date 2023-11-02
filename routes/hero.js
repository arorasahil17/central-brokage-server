import express from "express";
import { addHero, getHero, updateHero } from "../controller/hero.js";

const api = express.Router();

api
  .post("/add-hero", addHero)
  .get("/get-hero-details", getHero)
  .put("/update-hero/:id", updateHero);

export default api;
