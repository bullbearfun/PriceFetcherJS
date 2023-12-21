
export class BitgetOracle {
    constructor() {
        this.base_url = 'wss://ws.bitget.com/v2/ws/public'
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
                args: [{"instType": "SPOT", "channel": "ticker", 'instId': 'BTCUSDT'}],
            })
        }

        let that = this
        this.websocket.onmessage = (message) => {
            try {
                let json_msg = JSON.parse(message.data)

                if (json_msg?.action !== 'snapshot')
                    return

                let ask = parseFloat(json_msg.data[0].askPr)
                let bid = parseFloat(json_msg.data[0].bidPr)

                that.latest_price = (ask + bid) / 2

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