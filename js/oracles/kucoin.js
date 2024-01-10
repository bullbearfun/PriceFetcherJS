
export class KucoinOracle {
    constructor() {
        this.base_url = 'wss://ws-api-spot.kucoin.com/?token='
        this.latest_price = 0
        this.connect()
    }

    async connect() {
        let response = await fetch('https://backend.bullbear.fun/g/d/kucoin/token/')

        let data = await response.json()

        if (!data?.token) {
            console.error("Couldn't fetch token")
            console.log(data)
            return
        }

        let token = data.token

        this.websocket = new WebSocket(this.base_url + token)
        this._last_ping = Date.now() / 1000

        let that = this
        this.websocket.onerror = this.websocket.onclose = (e) => {
            that.latest_price = 0
            console.log(e)
        }

        this.websocket.onopen = () => {
            this.send_message({
                type: "subscribe",
                topic: "/market/ticker:BTC-USDT",
            })
        }

        this.websocket.onmessage = (message) => {
            try {
                let json_msg = JSON.parse(message.data)

                if (!json_msg?.topic?.startsWith('/market/ticker'))
                    return

                let ask = parseFloat(json_msg.data.bestAsk)
                let bid = parseFloat(json_msg.data.bestBid)

                that.latest_price = (ask + bid) / 2

                let _now = Math.floor(Date.now() / 1000)
                if (that._last_ping + 30 < _now) {
                    that.send_message({
                        id: _now.toString(),
                        type: "ping",
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