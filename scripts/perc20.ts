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
  const perc20 = await ethers.deployContract("PERC20Sample");
  await perc20.waitForDeployment();

  const contractAddress = perc20.target;
  console.log(
    `PERC20Sample was deployed to: ${contractAddress} <- copy that for "the deployed contract address"`
  );

  // Define file paths within the "Task contract" folder
  const contractFilePath = path.join(folderPath, 'contractperc20.txt');
  const txFilePath = path.join(folderPath, 'contractperc20tx.txt');

  // Write the contract address to contractperc20.txt
  fs.writeFileSync(contractFilePath, `|${contractAddress}`);
  console.log(`Contract address written to ${contractFilePath}`);

  // Wraps SWTR to PSWTR
  const tx = await owner.sendTransaction({
    from: owner.address,
    to: perc20.target,
    value: ethers.parseEther("0.001").toString(),
  });
  await tx.wait();

  // Transfer tokens
  const transfer = await sendShieldedTransaction(
    owner,
    perc20.target,
    perc20.interface.encodeFunctionData("transfer", [
      "0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1",
      ethers.parseEther("0.001").toString(),
    ]),
    0
  );
  await transfer.wait();
  console.log(
    `Transfer Response: https://explorer-evm.testnet.swisstronik.com/tx/${transfer.hash} <- copy that for URL`
  );

  // Write the transaction hash to contractperc20tx.txt
  fs.writeFileSync(txFilePath, `|https://explorer-evm.testnet.swisstronik.com/tx/${transfer.hash}`);
  console.log(`Transaction hash written to ${txFilePath}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
