import express from "express";
import cors from "cors";
import { calculateSettlements } from "./settle.js";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "expense-splitting-engine" });
});

app.post("/api/settle", (req, res) => {
  try {
    const { members = [], expenses = [] } = req.body;

    if (!Array.isArray(members) || !Array.isArray(expenses)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const result = calculateSettlements(members, expenses);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});