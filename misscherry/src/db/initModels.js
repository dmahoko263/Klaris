import { sequelize } from "./sequelize.js";
import { initModels } from "../models/index.js";

export async function initDatabase() {
  initModels();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  console.log(" Postgres connected + models synced");
}