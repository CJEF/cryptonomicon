<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="ticker"
                @keydown.enter="add()"
                type="text"
                name="wallet"
                id="wallet"
                class="
                  block
                  w-full
                  pr-10
                  border-gray-300
                  text-gray-900
                  focus:outline-none focus:ring-gray-500 focus:border-gray-500
                  sm:text-sm
                  rounded-md
                "
                placeholder="Например DOGE"
              />
              <label class="error-label red">Такой тикер уже добавлен</label>
            </div>
          </div>
        </div>
        <button
          @click="add()"
          type="button"
          class="
            my-4
            inline-flex
            items-center
            py-2
            px-4
            border border-transparent
            shadow-sm
            text-sm
            leading-4
            font-medium
            rounded-full
            text-white
            bg-gray-600
            hover:bg-gray-700
            transition-colors
            duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            focus:ring-gray-500
          "
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>
      <template v-if="tickers.length > 0">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button
            v-if="page > 1"
            @click="page = page - 1"
            class="
              mx-2
              my-4
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            @click="page = page + 1"
            class="
              my-4
              mx-2
              inline-flex
              items-center
              py-2
              px-4
              border border-transparent
              shadow-sm
              text-sm
              leading-4
              font-medium
              rounded-full
              text-white
              bg-gray-600
              hover:bg-gray-700
              transition-colors
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-gray-500
            "
          >
            Вперед
          </button>
        </div>
        <div>Фильтр:<input v-model="filter" @input="page = 1" /></div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            @click="select(t)"
            :key="t.name"
            :class="{
              'border-4': selectedTicker === t,
            }"
            class="
              bg-white
              overflow-hidden
              shadow
              rounded-lg
              border-purple-800 border-solid
              cursor-pointer
            "
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <!-- при клике на кнопку выбирается тикер из за всплытия метода (select(t)), чтобы этого избежать добавим модификатор .stop кнопке -->
            <button
              @click.stop="handleDelete(t)"
              class="
                flex
                items-center
                justify-center
                font-medium
                w-full
                bg-gray-100
                px-4
                py-4
                sm:px-6
                text-md text-gray-500
                hover:text-gray-600 hover:bg-gray-200 hover:opacity-20
                transition-all
                focus:outline-none
              "
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(bar, idx) in normalizedGraph"
            :key="idx"
            :style="{ height: `${bar}%` }"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button
          type="button"
          @click="selectedTicker = null"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
/*
[X] 1. Одинаковый код в watch
[ ] 2. При удалении остается подписка на обновления тикера
[ ] 3. Количество запросов к API
[ ] 4. Сильная связанность логики и данных которые влияют на отображение (запросы напряму внутри компонента)
[ ] 5. первый watch запускает второй watch page()
[ ] 6. Обработка ошибок API
[X] 7. При удалении тикера он не удаляется в LocalStorage
[ ] 8. График ужасно выглядит когда много цен
[ ] 9. localstorage и анонимные вкладки
[ ] 10. Магические строки и числа (URL, 5000 мс задержки, ключ локал сторедж, количество страниц)

[X] 11. Наличие в состоянии зависимых данных (не используется computed)

Параллельно
[X] 12. График сломан если везде одинаковые значения
[X] 13. При удалении тикера остается выбор

*/

import { loadTickers } from "./api";

export default {
  name: "App",

  data() {
    return {
      ticker: "", // строка написанная в инпуте с аттрибутом v-model="ticker"
      tickers: [], // массив тикеров пришедших из localstorage
      selectedTicker: null, // ячейка графика по умолчанию
      graph: [], // график
      page: 1, // страница фильтрации
      filter: "", // строка которую ввел и в инпут фильтрации
    };
  },

  created() {
    const tickersData = localStorage.getItem("cryptonomicon-ticker"); // [{"name":"BTC","price":"46241.63"},{"name":"DOGE","price":"-"}]
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    ); // {"this.filter ": " ", page: "1"}

    const VALID_KEYS = ["filter", "keys"];

    VALID_KEYS.forEach((key) => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    console.log(windowData);

    if (windowData.filter) {
      // если у нас есть фильтр, меняем его значение на фильтр из урла ?
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      // если у нас есть страница, меняем ее значение на номер страницы из урла ?
      this.page = windowData.page;
    }

    // если есть тикерс дата парсим ее и делаем запрос по прайсу на данные тикеры из tickers
    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      /*this.tickers.forEach((ticker) => {
        this.subscribeToUpdates(ticker.name);
      }); */
    }

    setInterval(this.updateTickers, 4000); // vue атвоматически выполняет операцию bind для всех методов, поэтому и работает this
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6; // 0
    },
    endIndex() {
      return this.page * 6; // 6
    },

    filteredTickers() {
      /* const start = (this.page - 1) * 6; // 0
      const end = this.page * 6; // 6 */
      /* const filteredTickers = this.tickers.filter((ticker) => { // ! кривые скобки ошибка?
        ticker.name.includes(this.filter);
      }); */
      return this.tickers.filter((ticker) => ticker.name.includes(this.filter));
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      // проверяется с помощью сравнения номера последнего тикера на странице с tickers.length
      return this.filteredTickers.length > this.endIndex; // если у нас отфильрованных тикеров больше 6, вернет true
    },
    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  methods: {
    formatPrice(price) {
      if (price === "-") {return price;}
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    async updateTickers() {
      if (!this.tickers.length) {
        return;
      }

      // подписываемся для обновления прайса
      const exchangeData = await loadTickers(this.tickers.map(t => t.name)); // прилетают тикеры и берем их название
      console.log("exchangeData", exchangeData);
      this.tickers.forEach((ticker) => {
        // мутировать массив нормально, так как вью реактивен, и не  нужно изменять массив как в реакте
        const price = exchangeData[ticker.name.toUpperCase()];
        ticker.price = price ?? "-";
      });

      /* this.tickers.find((t) => t.name === tickerName).price = // обновляем прайс нашего тикера
        exchangeData.USD > 1
          ? exchangeData.USD.toFixed(2)
          : exchangeData.USD.toPrecision(2); // (num).toFixed(digits) округляет цифры num после запятой до  количества переданного в (digits), num.toPrecision(digit) задает max количество цифр в числа num
      // currentTicker.price = exchangeData.USD;
      if (this.selectedTicker?.name === tickerName) {
        // обновляем график
        this.graph.push(exchangeData.USD); // передаем в массив графика стоимость криптовалюты для формирования новой ячейки
      } */
    },

    add() {
      const currentTicker = {
        name: this.ticker, // создается новый тикер с названием введенным в инпут
        price: "-", // присваевается прайс затычка, до того как будет запрос на сервер о прайсе
      };

      //this.tickers.push(currentTicker); // добавляем в массив тикеров наш тикер
      this.tickers = [...this.tickers, currentTicker];
      this.filter = ""; // очистка фильтра

      //this.subscribeToUpdates(currentTicker.name); // делаем запрос на сервер о налиции тикера и его прайса

      // console.log(this.tickers);

      /* console.log(this.tickers);
      function checkCoin() {
        let label = document.querySelector(".error-label");
        // console.log('here', this.tickers.target[0].name);
        if (this.tickers.length > 0) {
          for (let index = 0; index < this.tickers.length; index++) {
            const element = this.tickers[index].name;
            console.log(element);
            if (name == element) {
              label.classList.add("active");
            } else {
              label.classList.remove("active");
            }
          }
        }
      }
      checkCoin(); */
    },
    select(ticker) {
      this.selectedTicker = ticker; // обновляем v-model sel = выбранный тикер
      // console.log(ticker); // Proxy{name: "BTC", price: "45203.35"}
    },
    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter((t) => t != tickerToRemove); // оставляем все тикеры кроме того что было введено в

      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
    },
  },
  // watch следит за значениями в модели и при их изменении вызывает функции которые мы создали ниже
  watch: {
    selectedTicker() {
      this.graph = []; // обнуляем массив (очищаем график)
    },

    tickers(oldvalue, newValue) {
      // ? почему не сработал watch при добавлении тикера
      console.log(oldvalue, newValue);
      localStorage.setItem(
        // после обновления массива с тикерами, обновляем обьект в локалсторедж
        "cryptonomicon-ticker",
        JSON.stringify(this.tickers)
      );
    },
    paginatedTickers() {
      // если на странице 0 тикеров и номер страницы больше 1, уходим на 1 страницу назад
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
    // изменяем фильтр
    filter() {
      // смотрим за изменениями в фильтре, и сбрасываем страницу к 1,
      this.page = 1;
    },
    // аналогично фильру изменяем страницу
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
  },
};
</script>
