import UpstoxSdk from "upstox-js-sdk";

export const createUpstoxClient = (accessToken: string) => {
  const client = new UpstoxSdk.ApiClient(false);
  client.authentications["OAUTH2"].accessToken = accessToken;
  return {
    orders: new UpstoxSdk.OrderApiV3(client),
    market: new UpstoxSdk.MarketQuoteV3Api(client),
  };
};
