import { Router } from "express";
import { fetchNetworkActivities } from "../controllers/networkActivity.controller.js";

const router = Router();

router.get("/", fetchNetworkActivities);

export default router;