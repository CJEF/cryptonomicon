const API_KEY =
  "6138e504f3195d7a7e9a501c99b2fc820243ef999b2f010c280f63805b44d7b6";

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const tickersHandlers = new Map();

const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";

socket.addEventListener("message", e => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: params,
  } = JSON.parse(e.data);
  console.log(JSON.parse(e.data));
  /* if (type === INVALID_SUB) {
    console.log(params); // PARAMETER: "5~CCCAGG~BTCD~USD"
    console.log(subscribeToBTCOnWs({
      action: "SubAdd",
      subs: [`${params}`],
    }));
  } */
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
});

// TODO: REFACTOR SEARCH PARAMS


function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);
  // console.log(stringifiedMessage);

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

function subscribeToBTCOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~BTC`],
  });
}
function subscribeToUSDOnWs(ticker) {
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
  const subscribers = tickersHandlers.get(ticker) || []; // создаем константу с массивом из названий тикеров
  tickersHandlers.set(ticker, [...subscribers, cb]); // устанавливаем в массив тикеров новые тикеры, set принимает два параметра, первый key, второй value
  subscribeToUSDOnWs(ticker)
};

export const unSubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};
