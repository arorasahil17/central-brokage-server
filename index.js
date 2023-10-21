import express from "express";
const server = express();
const port = process.env.PORT;
import loadRouter from "./routes/loads.js";
import connectDb from "./database/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.js";
import asyncErrorHandler from "./middleware/errorHandler.js";
import bookingRouter from "./routes/booking.js";
import bidsController from "./routes/bid.js";
import adminRouter from "./routes/admin.js";
import path from "path";
import { fileURLToPath } from "url";

connectDb();
server.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
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

server.use(express.static(path.join(__dirname, "dist")));

server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

server.listen(port, () => console.log(`Server is running on ${port}`));
