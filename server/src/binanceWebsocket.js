const currencies = require('./currencies')
const Binance = require('node-binance-api');
const binanceCredentials = require('../credentials/binance')
const binance = new Binance().options({
    APIKEY: binanceCredentials.APIKEY,
    APISECRET: binanceCredentials.APISECRET,
    recvWindow: 500
});

let charts = {
    0: null,
    1: null,
    2: null
}
let pair0 = currencies.pair0
let pair1 = currencies.pair1
let pair01 = currencies.pair01
const limit = 20

module.exports.init = (callback) => {
    binance.websockets.chart(pair0, "1m", (symbol, interval, chart) => {
        //let tick = binance.last(chart);
        //const last = chart[tick].close;
        //console.info(chart);
        // Optionally convert 'chart' object to array:
        // let ohlc = binance.ohlc(chart);
        // console.info(symbol, ohlc);
        //console.info(symbol + " last price: " + last)

        //strange update every minute
        //remember to use deep copy
        if (Object.keys(chart).length == limit - 1) {
            if (charts[0] == null) {
                charts[0] = Object.assign({}, chart)
            } else {
                let last = Object.keys(chart)[limit - 2]
                charts[0][last] = chart[last]
            }
        } else {
            charts[0] = Object.assign({}, chart)
        }
    }, limit);

    binance.websockets.chart(pair01, "1m", (symbol, interval, chart) => {
        if (Object.keys(chart).length == limit - 1) {
            if (charts[2] == null) {
                charts[2] = Object.assign({}, chart)
            } else {
                let last = Object.keys(chart)[limit - 2]
                charts[2][last] = chart[last]
            }
        } else {
            charts[2] = Object.assign({}, chart)
        }
    }, limit);

    binance.websockets.chart(pair1, "1m", (symbol, interval, chart) => {
        if (Object.keys(chart).length == limit - 1) {
            if (charts[1] == null) {
                charts[1] = Object.assign({}, chart)
            } else {
                let last = Object.keys(chart)[limit - 2]
                charts[1][last] = chart[last]
            }
        } else {
            charts[1] = Object.assign({}, chart)
        }

        if (callback) callback(charts)
    }, limit);
}

module.exports.charts = charts