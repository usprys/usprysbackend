// server.js
import express from "express";
import getStudentID from "./routes/getStudentID.js";
import cors from "cors";
const app = express();
// ✅ Enable CORS for your frontend origin
app.use(
  cors({
    origin: "*", // allow your frontend
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json()); // replaces body-parser
app.use("/api/getStudentID", getStudentID);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
