import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createProduct, getProducts, getProductDetails } from "@/controllers";

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
app.get("/products/:id", getProductDetails);
app.post("/products", createProduct);
app.get("/products", getProducts);
// app.put("/products/:id", updateInventory);

app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});
const port = process.env.PORT || 4001;
const serviceName = process.env.SERVICE_NAME || "Product-Service";

app.listen(port, () => {
  console.log(`Alhamdu lillah, ${serviceName} is running on port ${port}`);
});
