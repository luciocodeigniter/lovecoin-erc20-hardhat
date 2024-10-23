import dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: {
        // essas palavras chaves para geração das 12 carteiras são usadas pelo hardhat
        mnemonic: "test test test test test test test test test test test junk"
      }
    },
    sepolia: {
      url: process.env.INFURA_URL,
      chainId: 11155111,
      accounts: {
        mnemonic: process.env.SECRET
      },
      gasPrice: 3000000 //! Só consegui fazer o deploy com o `gasPrice`
    }
  },
  etherscan: {
    apiKey: process.env.API_KEY
  },
};


export default config;
