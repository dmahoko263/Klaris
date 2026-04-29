import { Router } from "express";
import { verifyBatch } from "../controllers/verifications.controller.js";

const router = Router();

/*
========================================
PUBLIC VERIFICATION ROUTES
Anyone can verify a medicine batch
No login required
========================================
*/

// verify using QR / batch ID
router.post("/", verifyBatch);

// verify directly using route param
router.get("/:batchId", (req, res, next) => {
  req.body = {
    ...req.body,
    batchId: req.params.batchId,
    method: "QR",
    inputValue: req.params.batchId,
  };

  next();
}, verifyBatch);


export default router;