import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { EventEmitter } from 'events';
import https from 'https';
import fs from 'fs';

import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";
import bookRoutes from "./src/routes/books.js";
import transactionRoutes from "./src/routes/transactions.js";
import categoryRoutes from "./src/routes/categories.js";
import reviewRoutes from "./src/routes/reviews.js";
import recoveryRoutes from "./src/routes/recovery.js";
import proxyRoute from "./src/routes/proxy.js";
import bookcopies from "./src/routes/bookcopies.js";
import Notification from "./src/routes/notification.js";

/* App Config */
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

/* Middlewares */
app.use(express.json());
app.use(cors());

/* Set max listeners for EventEmitter */
EventEmitter.defaultMaxListeners = 15;

/* API Routes */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/recovery", recoveryRoutes);
app.use("/api/bookData", proxyRoute);
app.use("/api/bookcopies", bookcopies);
app.use("/api/notification", Notification); // Adjust the path here

/* Error Handling Middleware */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

/* MongoDB connection */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MONGODB CONNECTED");
  })
  .catch((err) => {
    console.error("MONGODB CONNECTION ERROR:", err);
  });

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

/* Create HTTPS server */
const server = https.createServer(options, app);

/* Port Listening In (bind to all network interfaces) */
server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on https://localhost:${port}`);
});

