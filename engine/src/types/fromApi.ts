export const CREATE_ORDER = "CREATE_ORDER";
export const CANCEL_ORDER = "CANCEL_ORDER";

export const GET_DEPTH = "GET_DEPTH";
export const GET_OPEN_ORDERS = "GET_OPEN_ORDERS";
export const GET_BALANCE = "GET_BALANCE";
export const DEPOSIT = "DEPOSIT";
export const WITHDRAW = "WITHDRAW";
export const GET_BALANCE_QUOTE = "GET_BALANCE_QUOTE";

export type MessageFromApi =
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
      type: typeof GET_OPEN_ORDERS;
      data: {
        userId: string;
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
      type: typeof DEPOSIT;
      data: {
        userId: number;
        amount: number;
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
      type: typeof GET_BALANCE_QUOTE;
      data: {
        userId: number;
        quoteAsset: string;
      };
    };
