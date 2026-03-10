import express from "express";  // Import Express
import cors from "cors";  // Import CORS
import dotenv from "dotenv";  // Import dotenv
import { router as todoRouter } from "./routes/todoRouter.js";  // Correct import statement
import jwt from "jsonwebtoken";  // Import JWT

// Load environment variables
dotenv.config();

// Express application setup
const app = express();

// Enable CORS
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Use the todoRouter for all routes starting with '/'
app.use("/", todoRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err?.status || 500;
  res.status(status).json({ error: { message: err.message, status } });
});

export default app;  // Export the app to be used in server.js