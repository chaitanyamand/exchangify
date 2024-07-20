import { RedisManager } from "./RedisManager";
import { MarketManager } from "./marketManager";

const main = async () => {
  const instance = new RedisManager();
  await instance.subscribeToPs();
  instance.setupCleanupJob(MarketManager.getInstance().getAllMarkets());
};
main();
