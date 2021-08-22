const API_KEY =
  "6138e504f3195d7a7e9a501c99b2fc820243ef999b2f010c280f63805b44d7b6";

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const tickersHandlers = new Map();

const AGGREGATE_INDEX = "5";

socket.addEventListener("message", e => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

// TODO: REFACTOR SEARCH PARAMS

/* export const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys(),
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((r) => r.json())
    .then((rawData) => {
      //Трансформации объектов. С Object.fromEntries, обратным ему методом Object.entries() и методами манипулирования массивами вы можете преобразовывать объекты следующим образом:
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      ); //  Object.entries разделит пары ключ со значение в обьекте, на отдельные массивы
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
}; */

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}
function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  /* if(!ticker.has(ticker)) {
    tickersHandlers.set(ticker, []);
  } */
  const subscribers = tickersHandlers.get(ticker) || []; // создаем константу с массивом из названий тикеров
  tickersHandlers.set(ticker, [...subscribers, cb]); // устанавливаем в массив тикеров новые тикеры, set принимает два параметра, первый key, второй value
  subscribeToTickerOnWs(ticker);
};

export const unSubscribeFromTicker = (ticker) => {
  /* const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(
    ticker,
    subscribers.filter((fn) => fn !== cb)
  ); */
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};

/* setInterval(loadTickers, 5000); */
