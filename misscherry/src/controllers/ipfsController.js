import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

/**
 * Upload JSON metadata to IPFS
 * POST /api/ipfs/upload-metadata
 */
export async function uploadMetadata(req, res) {
  try {
    const metadata = req.body;

    if (!metadata || Object.keys(metadata).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Metadata payload is required",
      });
    }

    const options = {
      pinataMetadata: {
        name: `pharma-metadata-${Date.now()}`,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };

    const result = await pinata.pinJSONToIPFS(metadata, options);

    return res.status(201).json({
      success: true,
      message: "Metadata uploaded to IPFS successfully",
      cid: result.IpfsHash,
      uri: `ipfs://${result.IpfsHash}`,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    });
  } catch (error) {
    console.error("uploadMetadata error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload metadata to IPFS",
      error: error.message,
    });
  }
}

/**
 * Upload file to IPFS
 * POST /api/ipfs/upload-file
 */
export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const stream = Readable.from(req.file.buffer);

    const options = {
      pinataMetadata: {
        name: req.file.originalname || `file-${Date.now()}`,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };

    const result = await pinata.pinFileToIPFS(stream, options);

    return res.status(201).json({
      success: true,
      message: "File uploaded to IPFS successfully",
      cid: result.IpfsHash,
      uri: `ipfs://${result.IpfsHash}`,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error("uploadFile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload file to IPFS",
      error: error.message,
    });
  }
}

/**
 * Get content info by CID
 * GET /api/ipfs/:cid
 */
export async function getByCid(req, res) {
  try {
    const { cid } = req.params;

    if (!cid) {
      return res.status(400).json({
        success: false,
        message: "CID is required",
      });
    }

    return res.status(200).json({
      success: true,
      message: "IPFS resource found",
      cid,
      uri: `ipfs://${cid}`,
      url: `https://gateway.pinata.cloud/ipfs/${cid}`,
    });
  } catch (error) {
    console.error("getByCid error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get IPFS resource",
      error: error.message,
    });
  }
}