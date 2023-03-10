import { ethers, run } from "hardhat";

const OWNER = '0xcC7b81574e119976adA1b273F9242b91362F9383';
const WHITELIST: string[] = []
async function main() {
  const safeOption_factory = await ethers.getContractFactory("SafeOption");
  const safeOption = await safeOption_factory.deploy(OWNER, WHITELIST);
  await safeOption.deployed();

  await safeOption.transferOwnership(OWNER)

  console.log('SafeOption:', safeOption.address);

  await sleep(30000);

  await run("verify:verify", {
    address: safeOption.address,
    constructorArguments: [OWNER, WHITELIST],
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
