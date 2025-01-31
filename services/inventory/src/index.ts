import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import {
  createInventory,
  getInventoryById,
  getInventoryDetails,
  updateInventory,
} from "@/controllers";

const app = express();
app.use([express.json(), cors(), morgan("dev")]);

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Alhamdu lillah", status: "UP" });
});
app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:8081", "http://172.0.0.1"];
  const origin = req.headers.origin || "";
  if (!allowedOrigins.includes(origin)) {
    res.status(403).json({ code: 403, message: "Forbidden" });
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", origin);
  next();
});
app.get("/inventories/:id", getInventoryById);
app.get("/inventories/:id/details", getInventoryDetails);
app.post("/inventories", createInventory);
app.put("/inventories/:id", updateInventory);

app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});
const port = process.env.PORT || 4002;
const serviceName = process.env.SERVICE_NAME || "Inventory-Service";

app.listen(port, () => {
  console.log(`Alhamdu lillah, ${serviceName} is running on port ${port}`);
});
