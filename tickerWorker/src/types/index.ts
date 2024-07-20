export interface TradeData {
  time: Date;
  price: number;
  volume: number;
  currency_code: string;
}

export interface TickerData {
  volume: string;
  quoteVolume: string;
  firstPrice: string;
  lastPrice: string;
  high: string;
  low: string;
  priceChange: string;
  priceChangePercent: string;
  symbol: string;
  trades: string;
}
