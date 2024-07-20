export interface KLine {
  close: string;
  end: string;
  high: string;
  low: string;
  open: string;
  quoteVolume: string;
  start: string;
  trades: string;
  volume: string;
}

export interface OpenOrder {
  orderId: string;
  executedQty: number;
  price: string;
  quantity: string;
  side: "buy" | "sell";
  userId: string;
}

export interface WithdrawDepositStatus {
  status: "success" | "invalid jwt token" | "error";
}

export interface Trade {
  id: number;
  isBuyerMaker: boolean;
  price: string;
  quantity: string;
  quoteQuantity: string;
  timestamp: number;
}

export interface Depth {
  bids: [string, string][];
  asks: [string, string][];
  lastUpdateId: string;
}

export interface Ticker {
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

export type DeletedOrder = {
  orderId: string;
  executedQty: number;
  remainingQty: number;
};

export type BuySellStatus =
  | {
      orderId: string;
      executedQty: number;
      fills: {
        price: string;
        qty: number;
        tradeId: number;
      }[];
    }
  | { err: string };

export type DeleteOrderStatus = DeletedOrder | { err: string };
