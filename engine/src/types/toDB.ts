export interface Trade {
  time: Date;
  price: number;
  volume: number;
  currency_code: string | null;
}
