import {BinanceOracle} from "./oracles/binance.js";
import {KrakenOracle} from "./oracles/kraken.js";
import {BybitOracle} from "./oracles/bybit.js";
import {OKXOracle} from "./oracles/okx.js";
import {BitgetOracle} from "./oracles/bitget.js";
import {KucoinOracle} from "./oracles/kucoin.js";

const average = arr => {
  const sum = arr.reduce((acc, cur) => acc + cur);
  return sum / arr.length;
}

window.addEventListener('load', () => {
    const binance_oracle = new BinanceOracle()
    const kraken_oracle = new KrakenOracle()
    const bybit_oracle = new BybitOracle()
    const okx_oracle = new OKXOracle()
    const bitget_oracle = new BitgetOracle()
    const kucoin_oracle = new KucoinOracle()

    setInterval(() => {
        let binance_price = binance_oracle.get_latest_price()
        let kraken_price = kraken_oracle.get_latest_price()
        let bybit_price = bybit_oracle.get_latest_price()
        let okx_price = okx_oracle.get_latest_price()
        let bitget_price = bitget_oracle.get_latest_price()
        let kucoin_price = kucoin_oracle.get_latest_price()

        document.querySelector('div.price-box.binance').innerHTML = binance_price.toFixed(4)
        document.querySelector('div.price-box.kraken').innerHTML = kraken_price.toFixed(4)
        document.querySelector('div.price-box.bybit').innerHTML = bybit_price.toFixed(4)
        document.querySelector('div.price-box.okx').innerHTML = okx_price.toFixed(4)
        document.querySelector('div.price-box.bitget').innerHTML = bitget_price.toFixed(4)
        document.querySelector('div.price-box.kucoin').innerHTML = kucoin_price.toFixed(4)


        let price_array = [binance_price, kraken_price, bybit_price, okx_price, bitget_price, kucoin_price]
        if (price_array.includes(0)) {
            document.querySelector('div.price-box.live-price').innerHTML = "---"
            return
        }

        let avg_price = average(price_array)
        document.querySelector('div.price-box.live-price').innerHTML = avg_price.toFixed(4)

    }, 200)

}, false);