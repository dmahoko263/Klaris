import { create } from "ipfs-http-client";

// Connect to local or remote IPFS node
const client = create({ url: "https://ipfs.infura.io:5001/api/v0" });

export async function uploadToIPFS(data) {
  const { cid } = await client.add(JSON.stringify(data));
  return cid.toString();
}