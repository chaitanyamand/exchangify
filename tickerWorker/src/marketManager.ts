export class MarketManager {
  private markets = new Set<string>();
  private static marketManagerInstance: MarketManager;

  public static getInstance() {
    if (!this.marketManagerInstance) {
      this.marketManagerInstance = new MarketManager();
      return this.marketManagerInstance;
    }
    return this.marketManagerInstance;
  }

  addMarket(market: string) {
    this.markets.add(market);
  }

  checkIfMarket(market: string) {
    return this.markets.has(market);
  }

  getAllMarkets() {
    let listOfMarket: string[] = [];
    for (const market of this.markets) {
      listOfMarket.push(market);
    }
    return listOfMarket;
  }
}
