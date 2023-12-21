
export class BybitOracle {
    constructor() {
        this.base_url = 'wss://stream.bybit.com/v5/public/spot'
        this.latest_price = 0
        this.connect()
    }

    connect() {
        this.websocket = new WebSocket(this.base_url)
        this._last_ping = Date.now() / 1000

        this.websocket.onerror = this.websocket.onclose = (e) => {
            console.log(e)
        }

        this.websocket.onopen = () => {
            this.send_message({
                op: "subscribe",
                args: ['tickers.BTCUSDC'],
            })
        }

        let that = this
        this.websocket.onmessage = (message) => {
            let json_msg = JSON.parse(message.data)

            if (!json_msg?.topic?.startsWith('tickers'))
                return

            let price = json_msg?.data?.lastPrice
            if (!price)
                return

            that.latest_price = parseFloat(price)

            let _now = Math.floor(Date.now() / 1000)
            if (that._last_ping + 30 < _now) {
                that.send_message({
                    op: "ping",
                })
                that._last_ping = _now
            }
        }
    }

    send_message(message) {
        this.websocket.send(JSON.stringify(message))
    }

    get_latest_price() {
        return this.latest_price
    }
}