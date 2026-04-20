import express from "express";
import cors from "cors";

import pharmaRoutes from "./routes/pharma.routes.js";
import walletRoleRoutes from "./routes/walletRole.routes.js";
import auth from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import ipfsRoutes from "./routes/ipfsRoutes.js"; // ✅ ADD THIS
import networkActivityRoutes from "./routes/networkActivity.routes.js";

import { setupSwagger } from "./config/swagger.js";

export const app = express();
const corsOptions = {
  // Add both localhost (for your computer) and your IP (for your phone)
  origin: [
    'http://localhost:4200', 
     'http://192.168.100.124:4200' 
  ],
  credentials: true, // Allow cookies or headers if needed
};

app.use(cors(corsOptions));
// Middleware
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API alive" });
});

// Routes
app.use("/api/pharma", pharmaRoutes);
app.use("/api/ipfs", ipfsRoutes); // ✅ ADD THIS (IMPORTANT)]
app.use("/api/network-activity", networkActivityRoutes);
app.use("/api/wallet-roles", walletRoleRoutes);
app.use("/api/auth", auth);
app.use("/api/users", userRoutes);

// Swagger docs
setupSwagger(app);