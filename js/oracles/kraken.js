
export class KrakenOracle {
    constructor() {
        this.base_url = 'wss://ws.kraken.com'
        this.latest_price = 0
        this.connect()
    }

    connect() {
        this.websocket = new WebSocket(this.base_url)
        this._last_ping = Date.now() / 1000

        let that = this
        this.websocket.onerror = this.websocket.onclose = (e) => {
            that.latest_price = 0
            console.log(e)
        }

        this.websocket.onopen = () => {
            this.send_message({
                event: "subscribe",
                pair: ['BTC/USD'],
                subscription: {name: "trade"}
            })
        }

        this.websocket.onmessage = (message) => {
            try {
                let json_msg = JSON.parse(message.data)

                if (json_msg[2] !== 'trade')
                    return

                that.latest_price = parseFloat(json_msg[1][0][0])

                let _now = Math.floor(Date.now() / 1000)
                if (that._last_ping + 30 < _now) {
                    that.send_message({
                        event: "ping",
                    })
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