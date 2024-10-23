// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LoveCoinModule = buildModule("LoveCoinModule", (m) => {
  
  const loveCoin = m.contract("LoveCoin");

  return { piticoBidugoCoin: loveCoin };
});

export default LoveCoinModule;
