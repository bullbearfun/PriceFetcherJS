
export class OKXOracle {
    constructor() {
        this.base_url = 'wss://ws.okx.com:8443/ws/v5/public'
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
                args: [{"channel": 'index-tickers', 'instId': 'BTC-USDT'}],
            })
        }

        let that = this
        this.websocket.onmessage = (message) => {
            try {
                let json_msg = JSON.parse(message.data)

                if (json_msg?.arg?.channel !== 'index-tickers')
                    return

                if (!json_msg?.data)
                    return

                that.latest_price = parseFloat(json_msg.data[0].idxPx)

                let _now = Math.floor(Date.now() / 1000)
                if (that._last_ping + 30 < _now) {
                    that.websocket.send('ping')
                    that._last_ping = _now
                }
            } catch (e) {
                that.latest_price = 0
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