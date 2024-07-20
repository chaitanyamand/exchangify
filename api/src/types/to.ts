import { CANCEL_ORDER, CREATE_ORDER, GET_BALANCE, GET_DEPTH, GET_BALANCE_QUOTE, GET_OPEN_ORDERS, DEPOSIT, WITHDRAW } from ".";

export type MessageToEngine =
  | {
      type: typeof CREATE_ORDER;
      data: {
        market: string;
        price: string;
        quantity: string;
        side: "buy" | "sell";
        userId: string;
      };
    }
  | {
      type: typeof CANCEL_ORDER;
      data: {
        orderId: string;
        market: string;
      };
    }
  | {
      type: typeof GET_DEPTH;
      data: {
        market: string;
      };
    }
  | {
      type: typeof GET_BALANCE;
      data: {
        userId: number;
      };
    }
  | {
      type: typeof GET_OPEN_ORDERS;
      data: {
        userId: string;
        market: string;
      };
    }
  | {
      type: typeof WITHDRAW;
      data: {
        userId: number;
        amount: number;
      };
    }
  | {
      type: typeof DEPOSIT;
      data: {
        userId: number;
        amount: number;
      };
    }
  | {
      type: typeof GET_BALANCE_QUOTE;
      data: {
        userId: number;
        quoteAsset: string;
      };
    };
