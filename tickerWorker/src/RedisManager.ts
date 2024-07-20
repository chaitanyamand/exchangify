import { createClient } from "redis";
import { Client } from "pg";
import { MarketManager } from "./marketManager";
import { TickerData, TradeData } from "./types";

const pgClient = new Client({
  user: "your_user",
  host: "localhost",
  database: "my_database",
  password: "your_password",
  port: 5433,
});
pgClient.connect();

export class RedisManager {
  private redisSubClient;
  private redisPubClient;
  private redisDbClient;

  constructor() {
    this.redisSubClient = createClient();
    this.redisPubClient = createClient();
    this.redisDbClient = createClient();

    this.redisSubClient.connect();
    this.redisPubClient.connect();
    this.redisDbClient.connect();
  }

  async subscribeToPs() {
    this.redisSubClient.subscribe("tradeAdded", async (message, channel) => {
      const parsedMessage = JSON.parse(message);
      const market: string = parsedMessage.market;
      const isInDB = MarketManager.getInstance().checkIfMarket(market);
      if (!isInDB) {
        MarketManager.getInstance().addMarket(market);
        const query = `SELECT *
                        FROM tata_prices
                        WHERE time >= NOW() - INTERVAL '24 hours'
                        ORDER BY time DESC;`;
        try {
          const result = await pgClient.query(query);
          const key = `trades:${market}`;
          for (const row of result.rows) {
            const trade: TradeData = {
              time: row.time,
              price: row.price,
              volume: row.volume,
              currency_code: row.currency_code,
            };
            await this.redisDbClient.zAdd(key, {
              score: trade.time.getTime(),
              value: JSON.stringify(trade),
            });
          }

          console.log(`Populated Redis with ${result.rows.length} trades for ${market}`);
        } catch (error) {
          console.log("Error while fetching from DB to Redis:", error);
        }
      }
      const ticker: TickerData = await this.calculateTickerData(market);

      this.redisPubClient.publish(
        "ticker@" + market,
        JSON.stringify({
          stream: `ticker@${market}`,
          data: {
            e: "ticker",
            c: ticker.lastPrice,
            h: ticker.high,
            l: ticker.low,
            v: ticker.volume,
            V: ticker.quoteVolume,
            s: ticker.symbol,
            p: ticker.priceChange,
            q: ticker.priceChangePercent,
          },
        })
      );
    });
  }

  async get24HourTrades(market: string) {
    const key = `trades:${market}`;
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const tradesData = await this.redisDbClient.zRangeByScore(key, twentyFourHoursAgo, now);
    return tradesData.map((tradeData) => JSON.parse(tradeData));
  }

  async calculateTickerData(market: string): Promise<TickerData> {
    const trades = await this.get24HourTrades(market);

    if (trades.length === 0) {
      return {
        volume: "0",
        quoteVolume: "0",
        firstPrice: "0",
        lastPrice: "0",
        high: "0",
        low: "0",
        priceChange: "0",
        priceChangePercent: "0",
        symbol: market,
        trades: "0",
      };
    }

    let volume = 0;
    let quoteVolume = 0;
    let high = -Infinity;
    let low = Infinity;
    const firstPrice = parseFloat(trades[0].price);
    const lastPrice = parseFloat(trades[trades.length - 1].price);

    for (const trade of trades) {
      const tradeQuantity = parseFloat(trade.volume);
      const tradePrice = parseFloat(trade.price);

      volume += tradeQuantity;
      quoteVolume += tradeQuantity * tradePrice;
      high = Math.max(high, tradePrice);
      low = Math.min(low, tradePrice);
    }

    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = (priceChange / firstPrice) * 100;

    return {
      volume: volume.toFixed(2),
      quoteVolume: quoteVolume.toFixed(6),
      firstPrice: firstPrice.toFixed(2),
      lastPrice: lastPrice.toFixed(2),
      high: high.toFixed(4),
      low: low.toFixed(4),
      priceChange: priceChange.toFixed(4),
      priceChangePercent: priceChangePercent.toFixed(2),
      symbol: market,
      trades: trades.length.toString(),
    };
  }

  async cleanupOldTrades(market: string) {
    const key = `trades:${market}`;
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    await this.redisDbClient.zRemRangeByScore(key, 0, twentyFourHoursAgo);
  }

  setupCleanupJob(markets: string[]) {
    setInterval(async () => {
      for (const market of markets) {
        await this.cleanupOldTrades(market);
      }
    }, 60 * 60 * 1000); // Run every hour
  }
}
