import { Client } from "pg";
import { createClient } from "redis";
import { DbMessage } from "./types";

const pgClient = new Client({
  user: "your_user",
  host: "localhost",
  database: "my_database",
  password: "your_password",
  port: 5433,
});
pgClient.connect();

async function main() {
  const redisClient = createClient();
  await redisClient.connect();
  console.log("connected to redis");

  while (true) {
    const response = await redisClient.rPop("db_processor" as string);
    if (!response) {
    } else {
      const data: DbMessage = JSON.parse(response);
      if (data.type === "TRADE_ADDED") {
        const price = data.data.price;
        const timestamp = new Date(data.data.timestamp);
        const volume = data.data.quantity;
        const query = "INSERT INTO tata_prices (time, price,volume) VALUES ($1, $2,$3)";
        const values = [timestamp, price, volume];
        if (!volume) console.log("volume is undefined in db index.ts");
        await pgClient.query(query, values);
      }
    }
  }
}

main();
