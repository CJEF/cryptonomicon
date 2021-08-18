const API_KEY =
  "6138e504f3195d7a7e9a501c99b2fc820243ef999b2f010c280f63805b44d7b6";
// TODO: REFACTOR SEARCH PARAMS
export const loadTicker = (tickers) =>
fetch(
`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.join(
    ","
)}&api_key=${API_KEY}`
).then(r => r.json());
