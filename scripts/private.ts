import { ethers } from "hardhat";
import { sendShieldedTransaction } from "../utils/swisstronik";
import fs from "fs";
import path from "path";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log("Deployer:", owner.address);

  // Define the path to the "Task contract" folder
  const folderPath = path.join(__dirname, '../Task contract');

  // Ensure the folder exists, create if it doesn't
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Deploy the contract
  const contract = await ethers.deployContract("MyPERC721Token");
  await contract.waitForDeployment();

  const contractAddress = contract.target;
  console.log(
    `Deployed to: ${contractAddress} <- copy that for "the deployed contract address"`
  );

  // Define file paths within the "Task contract" folder
  const contractFilePath = path.join(folderPath, 'contractprivate.txt');
  const txFilePath = path.join(folderPath, 'contractprivatetx.txt');

  // Write the contract address to contractprivate.txt
  fs.writeFileSync(contractFilePath, `|${contractAddress}`);
  console.log(`Contract address written to ${contractFilePath}`);

  // Mint tokens
  const safeMint = await sendShieldedTransaction(
    owner,
    contractAddress,
    contract.interface.encodeFunctionData("safeMint", [owner.address]),
    0
  );
  await safeMint.wait();

  console.log(
    `Mint Response: https://explorer-evm.testnet.swisstronik.com/tx/${safeMint.hash} <- copy that for URL`
  );

  // Write the transaction hash to contractprivatetx.txt
  fs.writeFileSync(txFilePath, `https://explorer-evm.testnet.swisstronik.com/tx/${safeMint.hash}`);
  console.log(`Transaction hash written to ${txFilePath}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
