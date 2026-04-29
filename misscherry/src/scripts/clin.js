import { Op } from "sequelize";
import { sequelize, initModels, NetworkActivity } from "../models/index.js";

async function cleanup() {
  try {
    initModels();

    await sequelize.authenticate();

    const deleted = await NetworkActivity.destroy({
      where: {
        type: "CALL",
        status: "SUCCESS",
        functionName: {
          [Op.in]: [
            "getBatch",
            "queryFilter(BatchRegistered)",
            "batchCount",
            "getBatchCount",
          ],
        },
      },
    });

    console.log(`✅ Deleted ${deleted} noisy network logs`);
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

cleanup();