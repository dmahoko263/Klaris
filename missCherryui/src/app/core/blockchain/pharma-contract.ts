export const PHARMA_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const PHARMA_CONTRACT_ABI = [
  'function registerBatch(uint256 batchId,string drugName,string manufacturerName,uint256 manufactureDate,uint256 expiryDate,string metadataURI)',
  'function transferOwnership(uint256 batchId,address newOwner,string note)',
  'function markDelivered(uint256 batchId)',
  'function recallBatch(uint256 batchId,string reason)',
  'function verifyAndLog(uint256 batchId,string note)',
  'function addManufacturer(address account)',
  'function addDistributor(address account)',
  'function addPharmacy(address account)',
  'function getBatch(uint256 batchId) view returns (tuple(uint256 batchId,string drugName,string manufacturerName,uint256 manufactureDate,uint256 expiryDate,string metadataURI,address manufacturer,address currentOwner,uint8 status,bool exists,bool suspicious,uint256 verificationCount,uint256 uniqueVerifierCount,uint256 createdAt))',
  'function verifyBatch(uint256 batchId) view returns (bool valid,string reason,string drugName,string manufacturerName,uint256 manufactureDate,uint256 expiryDate,address manufacturer,address currentOwner,uint8 status,bool suspicious,uint256 verificationCount)',
];