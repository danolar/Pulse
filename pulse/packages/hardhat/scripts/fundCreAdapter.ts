import "dotenv/config";
import { JsonRpcProvider, Wallet, parseEther, formatEther } from "ethers";
import { getCreAdapterAddress } from "./creAdapterWallet.js";

const DEFAULT_AMOUNT_ETH = "0.5";

async function main() {
  const deployerKey =
    process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  const amountArg = process.argv.find(a => a.startsWith("--amount="))?.split("=")[1];
  const amountEth = amountArg ?? process.env.FUND_AMOUNT_ETH ?? DEFAULT_AMOUNT_ETH;

  const rpc =
    process.env.SEPOLIA_RPC_URL ??
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY ?? "IZYEU2cWBgnFmgiTAgpWD"}`;

  const provider = new JsonRpcProvider(rpc);
  const sender = new Wallet(deployerKey, provider);
  const recipient = await getCreAdapterAddress();
  const value = parseEther(amountEth);

  const recipientCode = await provider.getCode(recipient);
  if (recipientCode !== "0x" && recipientCode.startsWith("0xef0100")) {
    throw new Error(
      `Recipient ${recipient} has EIP-7702 delegation and will not hold ETH. Run yarn cre:adapter:generate for a fresh wallet.`,
    );
  }

  const beforeBalance = await provider.getBalance(recipient);
  const senderBalance = await provider.getBalance(sender.address);
  if (senderBalance < value) {
    throw new Error(
      `Insufficient balance on ${sender.address}: ${formatEther(senderBalance)} ETH (need ${amountEth})`,
    );
  }

  console.log("From:", sender.address);
  console.log("To:", recipient);
  console.log("Amount:", amountEth, "ETH");

  const tx = await sender.sendTransaction({ to: recipient, value });
  console.log("Tx:", tx.hash);
  console.log("Waiting for confirmation…");
  const receipt = await tx.wait();
  if (!receipt || receipt.status !== 1) {
    throw new Error("Transfer transaction failed onchain.");
  }

  const afterBalance = await provider.getBalance(recipient);
  const received = afterBalance - beforeBalance;
  console.log("CRE adapter balance:", formatEther(afterBalance), "ETH");

  if (received < value) {
    throw new Error(
      `Recipient did not retain the transfer (received ${formatEther(received)} ETH). ` +
        "The address may be a public Hardhat account with an auto-sweeper — run yarn cre:adapter:generate.",
    );
  }

  console.log(`https://sepolia.etherscan.io/tx/${tx.hash}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
