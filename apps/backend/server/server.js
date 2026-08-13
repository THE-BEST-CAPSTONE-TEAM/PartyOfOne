import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import apiRoutes from "./routes/items.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "PartyOfOne backend is running." });
});

app.use("/api", apiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
