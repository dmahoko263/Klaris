import { Router } from "express";
import multer from "multer";
import {
  uploadMetadata,
  uploadFile,
  getByCid,
} from "../controllers/ipfsController.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post("/upload-metadata", uploadMetadata);
router.post("/upload-file", upload.single("file"), uploadFile);
router.get("/:cid", getByCid);

export default router;