import express from "express";
import cors from "cors";
import pharmaRoutes from "./routes/pharma.routes.js";
import { setupSwagger } from "./config/swagger.js";
import walletRoleRoutes from "./routes/walletRole.routes.js";
import auth from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API alive" });
});

app.use("/api/pharma", pharmaRoutes);
app.use("/api/wallet-roles", walletRoleRoutes);
app.use("/api/auth",auth)
app.use("/api/users", userRoutes);
setupSwagger(app);