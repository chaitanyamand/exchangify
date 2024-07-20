import { Router } from "express";
import { Client } from "pg";

const pgClient = new Client({
  user: "your_user",
  host: "localhost",
  database: "my_database",
  password: "your_password",
  port: 5433,
});

export const tradesRouter = Router();
pgClient.connect();

tradesRouter.get("/", async (req, res) => {
  const { market } = req.query;

  try {
    const query = `SELECT
    ROW_NUMBER() OVER ()::INT AS id,
    TRUE AS "isBuyerMaker",
    price::TEXT AS "price",
    volume::TEXT AS "quantity",
    (price * volume)::TEXT AS "quoteQuantity",
    FLOOR(EXTRACT(EPOCH FROM time)) AS "timestamp"
FROM
    tata_prices ORDER BY FLOOR(EXTRACT(EPOCH FROM time)) DESC LIMIT 50;`;
    const result = await pgClient.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tickers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
