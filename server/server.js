require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productionStageRoutes = require("./routes/productionStageRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const appSettingsRoutes = require("./routes/appSettingsRoutes");

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// CORS configuration - allow all origins for local development
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings/production-stages", productionStageRoutes);
app.use("/api/settings/app", appSettingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
