// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PiticoBidugoCoinModule = buildModule("PiticoBidugoCoinModule", (m) => {
  
  const piticoBidugoCoin = m.contract("PiticoBidugoCoin");

  return { piticoBidugoCoin };
});

export default PiticoBidugoCoinModule;
