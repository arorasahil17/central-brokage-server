import express from "express";
const server = express();
const port = process.env.PORT;
import loadRouter from "./routes/loads.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.js";
import asyncErrorHandler from "./middleware/errorHandler.js";
import bookingRouter from "./routes/booking.js";
import bidsController from "./routes/bid.js";
import adminRouter from "./routes/admin.js";
import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";
async function connectDb() {
  try {
    await mongoose.connect(
      "mongodb+srv://arorasahil074:kNd71q8R9soM82Mm@cluster0.7dyklld.mongodb.net/"
    );
    console.log("Connected to database");
  } catch (err) {
    console.log(`Error in connecting with database ${err}`);
  }
}

connectDb();
server.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:4173",
      "http://localhost:5173",
      "https://central-brokage-server.vercel.app/",
    ],
  })
);
server.use(express.json());
server.use(cookieParser());
server.use("/api", userRouter);
server.use("/api", loadRouter);
server.use("/api", bookingRouter);
server.use("/api", bidsController);
server.use("/api", adminRouter);
server.use(asyncErrorHandler);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

server.use(express.static(path.resolve(__dirname, "dist")));

server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

server.listen(port, () => console.log(`Server is running on ${port}`));
