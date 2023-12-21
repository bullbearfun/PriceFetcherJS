
export class KucoinOracle {
    constructor() {
        this.base_url = 'wss://ws-api-spot.kucoin.com/?token='
        this.latest_price = 0
        this.connect()
    }

    async connect() {
        let response = await fetch('https://api.kucoin.com/api/v1/bullet-public', {method: 'POST'})
        let data = await response.json()

        if (!data?.data?.token) {
            console.error("Couldn't fetch token")
            console.log(data)
            return
        }

        this.websocket = new WebSocket(this.base_url + data.data.token)
        this._last_ping = Date.now() / 1000

        this.websocket.onerror = this.websocket.onclose = (e) => {
            console.log(e)
        }

        this.websocket.onopen = () => {
            this.send_message({
                type: "subscribe",
                topic: "/market/ticker:BTC-USDT",
            })
        }

        let that = this
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
            } catch (e) {}
        }
    }

    send_message(message) {
        this.websocket.send(JSON.stringify(message))
    }

    get_latest_price() {
        return this.latest_price
    }
}