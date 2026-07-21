import { getSystemSetting } from "@/lib/settings";
import BalanceClient from "./BalanceClient";

export const dynamic = "force-dynamic";

export default async function BalancePage() {
  const minDepositSetting = await getSystemSetting("MIN_DEPOSIT_LIMIT", "10");
  const minDeposit = parseFloat(minDepositSetting) || 10;

  return <BalanceClient minDeposit={minDeposit} />;
}
