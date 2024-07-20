import axios from "axios";

const BASE_URL = "http://localhost:3000";
const TOTAL_BIDS = 100;
const TOTAL_ASK = 100;
const MARKET = "TATA_INR";
const USER_ID = "5";
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;
const jwtToken = process.env.JWT_TOKEN_MM;

async function main() {
  try {
    const price = 1000 + Math.random() * 10;
    const openOrders = await retryOperation(() => axios.get(`${BASE_URL}/api/v1/order/open?userId=${USER_ID}&market=${MARKET}`));

    const totalBids = openOrders.data.filter((o: any) => o.side === "buy").length;
    const totalAsks = openOrders.data.filter((o: any) => o.side === "sell").length;

    const cancelledBids = await cancelBidsMoreThan(openOrders.data, price);
    const cancelledAsks = await cancelAsksLessThan(openOrders.data, price);

    let bidsToAdd = TOTAL_BIDS - totalBids - cancelledBids;
    let asksToAdd = TOTAL_ASK - totalAsks - cancelledAsks;

    while (bidsToAdd > 0 || asksToAdd > 0) {
      if (bidsToAdd > 0) {
        await retryOperation(() =>
          axios.post(`${BASE_URL}/api/v1/order`, {
            market: MARKET,
            price: (price - Math.random() * 1).toFixed(1).toString(),
            quantity: "1",
            side: "buy",
            jwtToken,
          })
        );
        bidsToAdd--;
      }
      if (asksToAdd > 0) {
        await retryOperation(() =>
          axios.post(`${BASE_URL}/api/v1/order`, {
            market: MARKET,
            price: (price + Math.random() * 1).toFixed(1).toString(),
            quantity: "1",
            side: "sell",
            jwtToken,
          })
        );
        asksToAdd--;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error("An error occurred in main:", error);
    setTimeout(main, RETRY_DELAY);
  }
}

async function cancelBidsMoreThan(openOrders: any[], price: number) {
  let promises: any[] = [];
  openOrders.map((o) => {
    if (o.side === "buy" && (o.price > price || Math.random() < 0.1)) {
      promises.push(
        retryOperation(() =>
          axios.delete(`${BASE_URL}/api/v1/order`, {
            data: {
              orderId: o.orderId,
              market: MARKET,
            },
          })
        )
      );
    }
  });
  await Promise.all(promises);
  return promises.length;
}

async function cancelAsksLessThan(openOrders: any[], price: number) {
  let promises: any[] = [];
  openOrders.map((o) => {
    if (o.side === "sell" && (o.price < price || Math.random() < 0.5)) {
      promises.push(
        retryOperation(() =>
          axios.delete(`${BASE_URL}/api/v1/order`, {
            data: {
              orderId: o.orderId,
              market: MARKET,
            },
          })
        )
      );
    }
  });

  await Promise.all(promises);
  return promises.length;
}

async function retryOperation(operation: () => Promise<any>, retries = MAX_RETRIES): Promise<any> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation. Attempts left: ${retries - 1}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    } else {
      throw error;
    }
  }
}

setInterval(main, 2000);
