import { ethers } from "ethers";
import "dotenv/config";
import { readFileSync } from "fs";
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
    "artifacts",
    "contracts",
    "MissCherryPharmaTrace.sol",
    "MissCherryPharmaTrace.json"
  );

  return readJson(artifactPath);
}

function loadIgnitionAddress() {
  const deployPath = path.join(
    __dirname,
    "..",
    "ignition",
    "deployments",
    "chain-31337",
    "deployed_addresses.json"
  );

  const deployed = readJson(deployPath);
  const key = "PharmaTraceModule#MissCherryPharmaTrace";
  const address = deployed[key];

  if (!address) {
    throw new Error(`No deployed contract address found for ${key}`);
  }

  return address;
}

const artifact = loadArtifact();
const abi = artifact.abi;

export const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL);

export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export const contractAddress =
loadIgnitionAddress()||  process.env.CONTRACT_ADDRESS 

const code = await provider.getCode(contractAddress);
console.log("Using contract:", contractAddress);
console.log("Contract code:", code.slice(0, 10), "len:", code.length);

if (code === "0x") {
  throw new Error(`No contract deployed at ${contractAddress}`);
}

export const pharma = new ethers.Contract(contractAddress, abi, wallet);