import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import apiRoutes from "./routes/items.js";

dotenv.config();

const app = express();
// const port = Number(process.env.PORT) || 3001;
const port = Number(process.env.PORT) || 3001;


// ✅ Single cors config, before everything else
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://partyofone2026.web.app",         // ✅ your Firebase URL
    "https://partyofone2026.firebaseapp.com", // ✅ Firebase alternate URL
  ],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use("/api", apiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
});