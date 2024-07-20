import axios, { AxiosResponse } from "axios";
import { Depth, KLine, Ticker, Trade, WithdrawDepositStatus, BuySellStatus, OpenOrder, DeletedOrder, DeleteOrderStatus } from "./types";
import jwt from "jsonwebtoken";
const BASE_URL = "http://localhost:3000/api/v1";

export async function getTicker(market: string): Promise<Ticker> {
  const tickers = await getTickers();
  const ticker = tickers.find((t) => t.symbol === market);
  if (!ticker) {
    throw new Error(`No ticker found for ${market}`);
  }
  return ticker;
}

export async function getTickers(): Promise<Ticker[]> {
  const response = await axios.get(`${BASE_URL}/tickers`);
  return response.data;
}

export async function getDepth(market: string): Promise<Depth> {
  const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
  return response.data;
}
export async function getTrades(market: string): Promise<Trade[]> {
  const response = await axios.get(`${BASE_URL}/trades?symbol=${market}`);
  return response.data;
}

export async function getKlines(market: string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
  const response = await axios.get(`${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
  const data: KLine[] = response.data;
  return data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
}

export async function getBalance(jwtToken: string, asset: string) {
  try {
    const response: AxiosResponse = await axios.post(`${BASE_URL}/balance/${asset}`, { jwtToken, asset });
    return response.data.balance;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.log("invalid jwt token");
        return -60;
      }
    }
    console.log("error fetching balance");
  }
}

export const deposit = async (jwtToken: string, amount: number): Promise<WithdrawDepositStatus> => {
  try {
    const response: AxiosResponse = await axios.post(`${BASE_URL}/users/deposit`, { jwtToken, amount });
    if (!response.data.success) {
      return { status: "error" };
    }
    return { status: "success" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { status: "invalid jwt token" };
      }
    }
    return { status: "error" };
  }
};

export const withdraw = async (jwtToken: string, amount: number): Promise<WithdrawDepositStatus> => {
  try {
    const response: AxiosResponse = await axios.post(`${BASE_URL}/users/withdraw`, { jwtToken, amount });
    if (!response.data.success) {
      return { status: "error" };
    }
    return { status: "success" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { status: "invalid jwt token" };
      }
    }
    return { status: "error" };
  }
};

export const createOrder = async (price: number, quantity: number, side: string, market: string, jwtToken: string): Promise<BuySellStatus> => {
  try {
    const response: AxiosResponse = await axios.post(`${BASE_URL}/order`, {
      price: price.toFixed(2).toString(),
      quantity: quantity.toFixed(2).toString(),
      side,
      market,
      jwtToken,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { err: "Invalid JWT Token" };
      }
    }
    return { err: "Error placing order" };
  }
};

export const getOpenOrders = async (userId: number, market: string): Promise<OpenOrder[]> => {
  try {
    const response: AxiosResponse = await axios.get(`${BASE_URL}/order/open`, { params: { userId: userId.toString(), market } });
    return response.data;
  } catch (error) {
    console.log("Error fetching open order");
    return [];
  }
};

export const deleteOpenOrder = async (orderId: string, market: string): Promise<DeleteOrderStatus> => {
  try {
    const response: AxiosResponse = await axios.delete(`${BASE_URL}/order`, { data: { orderId, market } });
    return response.data;
  } catch (error) {
    console.log("Error deleting order ");
    return { err: "Error deleting order" };
  }
};
