import { ethers } from "hardhat";
import { sendShieldedTransaction } from "../utils/swisstronik";
import fs from "fs";
import path from "path";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("Deployer:", owner.address);

  // Define the path to the new folder
  const folderPath = path.join(__dirname, '../Task contract');

  // Ensure the folder exists, create if it doesn't
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Deploy the contract
  const contract = await ethers.deployContract("MyERC721Token");
  await contract.waitForDeployment();
  console.log(`Deployed to: ${contract.target}`);

  // Define file paths within the "Task contract" folder
  const contractFilePath = path.join(folderPath, 'contracterc721.txt');
  const transactionFilePath = path.join(folderPath, 'contracterc721tx.txt');

  // Write the contract address to contracterc721.txt
  fs.writeFileSync(contractFilePath, `|${contract.target}`);
  console.log('Contract address saved to contracterc721.txt in "Task contract" folder');

  // Mint the token
  const safeMint = await sendShieldedTransaction(
    owner,
    contract.target,
    contract.interface.encodeFunctionData("safeMint", [owner.address]),
    0
  );

  await safeMint.wait();
  console.log(`Mint Response: https://explorer-evm.testnet.swisstronik.com/tx/${safeMint.hash}`);

  // Write the transaction hash to contracterc721tx.txt
  fs.writeFileSync(transactionFilePath, `|https://explorer-evm.testnet.swisstronik.com/tx/${safeMint.hash}`);
  console.log('Transaction hash saved to contracterc721tx.txt in "Task contract" folder');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
