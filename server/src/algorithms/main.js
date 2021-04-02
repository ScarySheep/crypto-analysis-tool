const indicator = require('./indicator')
const fs = require('fs');
const currencies = require('../currencies')
const binanceCredentials = require('../credentials/binance')
const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: binanceCredentials.APIKEY,
    APISECRET: binanceCredentials.APISECRET,
    recvWindow: 500
});
const getAverageRate = require('./getAverageRate')
const getRate = require('./getRate')

//amount of money for evaluation
const evaMoney = 10000

//amount of data per request
const dataLimit = 100

//time interval
const timeInterval = 1000
let interval = null

//amount of money while trading
const tradingMoney = 100

//trading fee
const tradingFee = 0.00075 * 0.9

//Temp record of currency data
let currencyRecordLimit = 10
let currencyRecord = [[], []]

//Temp record of indicators
let indicatorChart = []
let indicatorChartLimit = 30

//Determination of the indicator
let indicatorThreshold = 2.5

//lr parameters
let slopeThreshold = 0.8
let codThreshold = 0.8

//profit parameters
let profitPercentage = 0.004
let returnPointPercentage = 0.9
let stopLossPercentage = 0.01

//state
const finding = 0
const trading = 1
let state = finding

//close app
let exitApp = false

//trading log
let tradingLog = { data: [] }

module.exports.parameters = {
    indicatorThreshold,
    slopeThreshold,
    codThreshold,
    profitPercentage,
    returnPointPercentage,
    stopLossPercentage
}

module.exports.start = (indicatorCallback, trendCallback) => {
    //changes value when state = finding and all thresholds are met
    let tradingDecision = { symbol: -1, direction: '' }
    let tradingData = {
        startPrice: 0,
        highestPrice: 0,
        closePrice: 0,
        currentPrice: 0,
        closeReason: '',
        startTime: 0,
        elapsedTime: 0
    }
    interval = setInterval(() => {
        let orderbooks = getOrderBooks()
        orderbooks.then((res) => {
            loop(res.data, res.downData, res.upData, tradingDecision, tradingData, indicatorCallback, trendCallback)
        }, () => {
            indicatorCallback(false)
        })
    }, timeInterval)
}

module.exports.stop = () => {
    if (interval != null) {
        if (state == trading) {
            exitApp = true
        } else if (state == finding) {
            clearInterval(interval)
            saveFile('./', tradingLog, false)
            process.kill(process.pid, 'SIGTERM')
        }
    } else {
        console.log('Interval not started yet')
    }
}

//handle exit
process.on('SIGTERM', () => {
    process.exit(1)
})

function saveFile (relativePath, data, name) {
    let file = JSON.stringify(data);
    let fileName
    if (name) {
        fileName = relativePath + "logs/" + name + ".json"
    } else {
        let now = new Date().toISOString().
            replace(/-/, '_').
            replace(/T/, '_').
            replace(/\./, '_').
            replace(/Z/, '')
        //console.log(now)
        fileName = relativePath + "logs/" + now + ".json"
    }

    fs.writeFileSync(fileName, file);
}

function storeIndicatorRecords (value) {
    if (value) {
        if (indicatorChart.length == indicatorChartLimit) {
            indicatorChart.shift()
        }
        indicatorChart.push([value.time, value.profit])
        return indicatorChart
    }
    return false
}

function storeCurrencyRecords (data) {
    let ready = true
    currencyRecord.forEach((record, index) => {
        if (record.length == currencyRecordLimit) {
            record.shift()
        } else {
            ready = false
        }
        let rate = getAverageRate(data, index, 2, evaMoney, false)
        record.push({ time: Date.now(), x: 0, price: rate, y: 0 })
    })
    if (ready) {
        // remap time
        currencyRecord.forEach((element) => {
            let l = element.length
            for (let i = 0; i < l; i++) {
                element[i].x = (element[i].time - element[l - 1].time) / 1000
                element[i].y = (element[i].price - element[l - 1].price) / element[l - 1].price * 10000
            }
        })
        return currencyRecord
    }
    console.log('Not enough data for trend analysis yet')
    return false
}

async function getOrderBooks () {
    let depth0 = binance.depth(currencies.pair0, false, dataLimit)
    let depth1 = binance.depth(currencies.pair1, false, dataLimit)
    let depth01 = binance.depth(currencies.pair01, false, dataLimit)
    let depthDown0 = binance.depth(currencies.pairDown0, false, dataLimit)
    let depthDown1 = binance.depth(currencies.pairDown1, false, dataLimit)
    let depthUp0 = binance.depth(currencies.pairUp0, false, dataLimit)
    let depthUp1 = binance.depth(currencies.pairUp1, false, dataLimit)
    let depthArr = [depth01, depth0, depth1, depthDown0, depthDown1, depthUp0, depthUp1]

    //stupid js
    let currencyData = [[], [], []]
    let currencyDownData = [[], [], []]
    let currencyUpData = [[], [], []]

    await Promise.all(depthArr).then((data) => {
        for (let i = 0; i < 3; i++) {
            for (let j = i + 1; j < 3; j++) {
                currencyData[i][j] = data[i + j - 1].bids
                currencyData[j][i] = data[i + j - 1].asks
            }
        }
        for (let i = 0; i < 2; i++) {
            currencyDownData[i][2] = data[i + 3].bids
            currencyDownData[2][i] = data[i + 3].asks
        }

        for (let i = 0; i < 2; i++) {
            currencyUpData[i][2] = data[i + 5].bids
            currencyUpData[2][i] = data[i + 5].asks
        }
    }, (err) => {
        console.log('Error when getting orderbooks')
        console.error(err)
        throw new Error(false);
    })
    return { data: currencyData, downData: currencyDownData, upData: currencyUpData }
}

function linearRegression (xyArr) {
    let lr = {};
    let n = xyArr.length;
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;
    let sum_yy = 0;

    for (let i = 0; i < n; i++) {
        sum_x += xyArr[i].x;
        sum_y += xyArr[i].y;
        sum_xy += (xyArr[i].x * xyArr[i].y);
        sum_xx += (xyArr[i].x * xyArr[i].x);
        sum_yy += (xyArr[i].y * xyArr[i].y);
    }

    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
    lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);
    return lr;
}

function postIndicator (indicator, callback) {
    let indiRecords = storeIndicatorRecords(indicator)
    callback(indiRecords)
}

function postTrend (record, lr, callback) {
    let recordAnalysis = []
    record.forEach((element, index) => {
        let simplifyData = []
        element.forEach((e) => {
            const { x, y } = e
            simplifyData.push({ x, y })
        })
        recordAnalysis.push({
            symbols: currencies.symbols[index],
            slope: lr[index].slope,
            r2: lr[index].r2,
            intercept: lr[index].intercept,
            data: simplifyData
        })
    })
    callback(recordAnalysis)
}

function saveTradingData (tradingDecision, tradingData, profit) {
    let obj = {
        symbol: currencies.symbols[tradingDecision.symbol] + tradingDecision.direction,
        startPrice: tradingData.startPrice,
        highestPrice: tradingData.highestPrice,
        closePrice: tradingData.closePrice,
        closeReason: tradingData.closeReason,
        startTime: tradingData.startTime,
        elapsedTime: tradingData.elapsedTime / 1000,
        profit: profit
    }
    tradingLog.data.push(obj)
}

function resetTradingData (tradingData) {
    tradingData.startPrice = 0
    tradingData.highestPrice = 0
    tradingData.closePrice = 0
    tradingData.currentPrice = 0
    tradingData.closeReason = ''
    tradingData.startTime = 0
    tradingData.elapsedTime = 0
}

function calculatingProfit (tradingData) {
    return ((tradingData.closePrice / tradingData.startPrice - 1) - tradingFee * 2) * tradingMoney
}

function closeTrading (tradingDecision, tradingData) {
    tradingData.closePrice = tradingData.currentPrice
    tradingData.elapsedTime = Date.now() - tradingData.startTime
    let profit = calculatingProfit(tradingData)
    saveTradingData(tradingDecision, tradingData, profit)
    resetTradingData(tradingData)
    console.log(tradingLog)
    state = finding
    if (exitApp) {
        clearInterval(interval)
        saveFile('./', tradingLog, false)
        process.kill(process.pid, 'SIGTERM')
    }
}

function monitorTrading (tradingDecision, tradingData, upData, downData) {
    //getting bid and ask according to decision
    let symbol = tradingDecision.symbol
    let ask
    if (tradingDecision.direction == 'UP') {
        ask = getRate(upData, 2, symbol)
    } else if (tradingDecision.direction == 'DOWN') {
        ask = getRate(downData, 2, symbol)
    }
    //if this is the first time, record starting price
    if (tradingData.startPrice == 0) {
        tradingData.startPrice = ask
        console.log('Buying with price: ', tradingData.startPrice)
        tradingData.startTime = Date.now()
    }
    //set currentprice
    tradingData.currentPrice = ask
    console.log('Current price: ', tradingData.currentPrice)
    //set highest price
    if (tradingData.currentPrice > tradingData.highestPrice) {
        tradingData.highestPrice = tradingData.currentPrice
        console.log('Highest price: ', tradingData.highestPrice)
    }
    //if highest price is higher than profit percentage, check for loss
    let highestDelta = (tradingData.highestPrice - tradingData.startPrice) / tradingData.startPrice
    let currentDelta = (tradingData.currentPrice - tradingData.startPrice) / tradingData.startPrice
    console.log('highest delta: ', highestDelta, 'currentDelta: ', currentDelta)
    if (highestDelta > profitPercentage) {
        if ((currentDelta / highestDelta < returnPointPercentage) && (currentDelta > tradingFee * 2)) {
            //buy back and return
            tradingData.closeReason = 'Return point'
            closeTrading(tradingDecision, tradingData)
        }
    }
}

function loop (data, dataDown, dataUp, tradingDecision, tradingData, indicatorCallback, trendCallback) {
    //get all currency data
    let currencyData = data
    let currencyDownData = dataDown
    let currencyUpData = dataUp

    //checking for data completeness
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (i != j) {
                if (currencyData[i][j] == undefined) {
                    console.log('Currency data loss')
                    return false
                }
            }
            if (i != j && i + j != 1) {
                if (currencyDownData[i][j] == undefined || currencyUpData[i][j] == undefined) {
                    console.log('Currency data loss')
                    return false
                }
            }
        }
    }

    //store record of the past 10 seconds
    let record = storeCurrencyRecords(currencyData)
    //calculating indicator
    let indi = indicator(currencyData, evaMoney)
    postIndicator(indi, indicatorCallback)

    switch (state) {
        case finding: {
            //check if indicator are over threshold
            if (indi.profit > indicatorThreshold) {
                if (record) {
                    //do linear regression for each record
                    let lr = []
                    record.forEach((element) => {
                        lr.push(linearRegression(element))
                    })
                    //check if slope and r2 are over threshold
                    let r2 = codThreshold
                    lr.forEach((element, index) => {
                        //if all are over threshold
                        if (Math.abs(element.slope) > slopeThreshold && element.r2 > codThreshold) {
                            //find the one with higher cod
                            if (element.r2 > r2) {
                                r2 = element.r2
                                //set trading symbol
                                tradingDecision.symbol = index
                                tradingDecision.direction = element.slope > 0 ? 'UP' : 'DOWN'
                                state = trading
                                console.log('Switching state from finding to trading')
                            }
                        }
                    })
                    //push lr and record to front end
                    postTrend(record, lr, trendCallback)

                } else {
                    // not enough record
                    trendCallback(false)
                }
            }
            break
        }

        case trading: {
            monitorTrading(tradingDecision, tradingData, currencyUpData, currencyDownData)
            break
        }
    }
}