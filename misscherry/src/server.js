import "dotenv/config";
import { app } from "./app.js";
import { initDatabase } from "./db/initModels.js";

const port = process.env.PORT || 5000;

await initDatabase();

app.listen(port, () => {
  console.log(`✅ API running on ${port}`);
});