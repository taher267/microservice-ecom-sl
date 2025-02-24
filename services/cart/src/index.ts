import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { addToCart } from "@/controllers";

const app = express();
app.use([express.json(), cors(), morgan("dev")]);

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Alhamdu lillah", status: "UP" });
});

app.post("/cart/add-to-cart", addToCart);

app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});
const port = process.env.PORT || 4006;
const serviceName = process.env.SERVICE_NAME || "Cart-Service";

app.listen(port, () => {
  console.log(`Alhamdu lillah, ${serviceName} is running on port ${port}`);
});
