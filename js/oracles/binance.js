
export class BinanceOracle {
    constructor() {
        this.base_url = 'wss://stream.binance.com:9443/ws/btcusdt@bookTicker'
        this.latest_price = 0
        this.connect()
    }

    connect() {
        this.websocket = new WebSocket(this.base_url)

        let that = this
        this.websocket.onerror = this.websocket.onclose = (e) => {
            that.latest_price = 0
            console.log(e)
        }

        this.websocket.onmessage = (message) => {
            try {
                let json_msg = JSON.parse(message.data)
                let ask = parseFloat(json_msg['a'])
                let bid = parseFloat(json_msg['b'])
                that.latest_price = (ask + bid) / 2
            } catch (e) {
                that.latest_price = 0
            }
        }
    }

    get_latest_price() {
        return this.latest_price
    }
}