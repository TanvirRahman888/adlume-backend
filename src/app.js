import express from "express";
import cors from "cors";
import morgan from "morgan";
import projectRoutes from "./routes/projectRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/projects", projectRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reviews", reviewRoutes);



if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Adlume Media Backend API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server health check successful",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

export default app;