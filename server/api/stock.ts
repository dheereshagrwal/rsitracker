import axios from "axios";
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(); //parse the queries from the event.node.req.url
  const url = event.node.req.url;
  console.log("url", url);
  const apiKey = config.apiKey;
  const searchParams = new URLSearchParams(url?.split("?")[1]);

  const ticker = searchParams.get("ticker");
  const timespan = searchParams.get("timespan");
  const limit = searchParams.get("limit");

  console.log(ticker, timespan, limit);
  let rsi = 0;
  let percentage = 0;
  let currentPrice = 0;
  const response = await axios.get(
    `https://api.polygon.io/v1/indicators/rsi/${ticker}?timestamp=2023-06-16&timespan=${timespan}&adjusted=true&window=14&series_type=close&order=desc&limit=${limit}&apiKey=${apiKey}`
  );
  const values = response?.data?.results?.values;
  if (values && values.length > 0) {
    rsi = values[values.length - 1].value.toFixed(2);
  }
  const response2 = await axios.get(
    `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${apiKey}`
  );
  percentage = response2?.data?.ticker?.todaysChangePerc.toFixed(2);
  const response3 = await axios.get(
    `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/minute/2023-06-16/2023-06-16?adjusted=true&sort=desc&limit=1&apiKey=${apiKey}`
  );
  currentPrice = response3?.data?.results[0]?.c;
  return {
    rsi,
    percentage,
    currentPrice,
  };
});
