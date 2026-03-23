import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PharmaTraceModule", (m) => {
  // Use deployer wallet as initial admin
  const admin = m.getAccount(0);

  const pharmaTrace = m.contract("MissCherryPharmaTrace", [admin]);

  return { pharmaTrace };
});