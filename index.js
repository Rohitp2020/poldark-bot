// index.js (ESM style)

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./backend/api.js"; // must include .js extension in ESM
import dotenv from "dotenv";

dotenv.config(); // Load .env variables
const app = express();
const PORT = process.env.PORT || 3000;

// For __dirname in ESM (not available by default)
// convert "file://" URL into normal file path
//__filename → full path of the current file. 
const __filename = fileURLToPath(import.meta.url);
// get the folder path from file path
//__dirname → directory path of the current file. 
const __dirname = path.dirname(__filename);

// Middleware to parse JSON requests
app.use(express.json());

// Serve frontend files
//This tells Express:
//“Serve files inside public/ folder whenever the URL doesn’t match any API route.”
app.use(express.static(path.join(__dirname, "public")));

// Import backend API routes
app.use("/api", apiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
