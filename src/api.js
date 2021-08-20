const API_KEY =
  "6138e504f3195d7a7e9a501c99b2fc820243ef999b2f010c280f63805b44d7b6";

const tickers = new Map();
// TODO: REFACTOR SEARCH PARAMS

export const loadTickers = (tickers) => {
  if(tickers.size === 0) {
    return;
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.keys().join(
      ","
    )}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((r) => r.json())
    .then(
      (rawData) =>
        //Трансформации объектов. С Object.fromEntries, обратным ему методом Object.entries() и методами манипулирования массивами вы можете преобразовывать объекты следующим образом:
        Object.fromEntries(
          Object.entries(rawData).map(([key, value]) => [key, value.USD])
        ) //  Object.entries разделит пары ключ со значение в обьекте, на отдельные массивы
    )};

export const subscribeToTicker = (ticker, cb) => {
  /* if(!ticker.has(ticker)) {
    tickers.set(ticker, []);
  } */
  const subscribers = tickers.get(ticker) || []; // создаем константу с массивом из названий тикеров
  tickers.set(ticker, [...subscribers, cb]); // устанавливаем в массив тикеров новые тикеры, set принимает два параметра, первый key, второй value
};

export const unSubscribeToTicker = (ticker, cb) => {
  const subscribers = tickers.get(ticker) || [];
  tickers.set(
    ticker,
    subscribers.filter((fn) => fn !== cb)
  );
};

setInterval(loadTickers, 5000);
