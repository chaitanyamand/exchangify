export const CREATE_ORDER = "CREATE_ORDER";
export const CANCEL_ORDER = "CANCEL_ORDER";
export const GET_OPEN_ORDERS = "GET_OPEN_ORDERS";
export const GET_DEPTH = "GET_DEPTH";
export const GET_BALANCE = "GET_BALANCE";
export const GET_BALANCE_QUOTE = "GET_BALANCE_QUOTE";
export const DEPOSIT = "DEPOSIT";
export const WITHDRAW = "WITHDRAW";

export type MessageFromOrderbook =
  | {
      type: "DEPTH";
      payload: {
        market: string;
        bids: [string, string][];
        asks: [string, string][];
      };
    }
  | {
      type: "ORDER_PLACED";
      payload: {
        orderId: string;
        executedQty: number;
        fills: [
          {
            price: string;
            qty: number;
            tradeId: number;
          }
        ];
      };
    }
  | {
      type: "ORDER_CANCELLED";
      payload: {
        orderId: string;
        executedQty: number;
        remainingQty: number;
      };
    }
  | {
      type: "OPEN_ORDERS";
      payload: {
        orderId: string;
        executedQty: number;
        price: string;
        quantity: string;
        side: "buy" | "sell";
        userId: string;
      }[];
    }
  | {
      type: "BALANCE";
      payload: {
        balance: number;
      };
    }
  | {
      type: "BALANCEQUOTE";
      payload: {
        balance: number;
      };
    }
  | {
      type: "WITHDRAW";
      payload: {
        success: boolean;
      };
    }
  | {
      type: "DEPOSIT";
      payload: {
        success: boolean;
      };
    };
