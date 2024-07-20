import { RedisManager } from "../RedisManager";
import { Router } from "express";
import { Client } from "pg";

const pgClient = new Client({
  user: "your_user",
  host: "localhost",
  database: "my_database",
  password: "your_password",
  port: 5433,
});

pgClient.connect();

interface Ticker {
  firstPrice: string;
  high: string;
  lastPrice: string;
  low: string;
  priceChange: string;
  priceChangePercent: string;
  quoteVolume: string;
  symbol: string;
  trades: string;
  volume: string;
}

export const tickersRouter = Router();

tickersRouter.get("/", async (req, res) => {
  try {
    const query = `
      WITH daily_data AS (
        SELECT 
          currency_code,
          first(price, time) AS first_price,
          max(price) AS high,
          last(price, time) AS last_price,
          min(price) AS low,
          sum(volume) AS volume,
          count(*) AS trades
        FROM tata_prices
        WHERE time > NOW() - INTERVAL '24 hours'
        GROUP BY currency_code
      )
      SELECT 
        first_price::text AS "firstPrice",
        high::text AS "high",
        last_price::text AS "lastPrice",
        low::text AS "low",
        (last_price - first_price)::text AS "priceChange",
        (((last_price - first_price) / first_price) * 100)::text AS "priceChangePercent",
        (volume * last_price)::text AS "quoteVolume",
        'TATA_INR' AS "symbol",
        trades::text AS "trades",
        volume::text AS "volume"
      FROM daily_data;
    `;
    //Change symbol when scaling the markets
    const result = await pgClient.query(query);
    const tickers: Ticker[] = result.rows;

    res.json(tickers);
  } catch (error) {
    console.error("Error fetching tickers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
