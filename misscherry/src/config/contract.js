import { ethers } from "ethers";
import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function loadArtifact() {
  const artifactPath = path.join(
    __dirname,
    "..",
    "..",
    "artifacts",
    "contracts",
    "MissCherryPharmaTrace.sol",
    "MissCherryPharmaTrace.json"
  );

  if (!existsSync(artifactPath)) {
    throw new Error(`Contract artifact not found at ${artifactPath}`);
  }

  return readJson(artifactPath);
}

function loadIgnitionAddress() {
  const deployPath = path.join(
    __dirname,
    "..",
    "..",
    "ignition",
    "deployments",
    "chain-31337",
    "deployed_addresses.json"
  );

  if (!existsSync(deployPath)) {
    return null;
  }

  const deployed = readJson(deployPath);
  const key = "PharmaTraceModule#MissCherryPharmaTrace";

  return deployed[key] || null;
}

const artifact = loadArtifact();
const abi = artifact.abi;

export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ignitionAddress = loadIgnitionAddress();

export const contractAddress =
  ignitionAddress || process.env.CONTRACT_ADDRESS;

if (!contractAddress) {
  throw new Error(
    "No contract address found. Deploy with Ignition or set CONTRACT_ADDRESS in .env"
  );
}

const code = await provider.getCode(contractAddress);
console.log("Using contract:", contractAddress);
console.log("Contract code:", code.slice(0, 10), "len:", code.length);

if (code === "0x") {
  throw new Error(`No contract deployed at ${contractAddress}`);
}

export const pharma = new ethers.Contract(contractAddress, abi, wallet);
export { abi };