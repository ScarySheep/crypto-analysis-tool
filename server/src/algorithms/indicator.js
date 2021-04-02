const getAverageRate = require('./getAverageRate')

//data - currency data
function descending (data, averageSize) {
    //observering orders as if we are placing limit orders
    //neglecting fee since it's porpotional to total
    //regardless of min lot because it's just an indicator
    let rate1 = getAverageRate(data, 1, 2, averageSize, false)
    let rate01 = getAverageRate(data, 0, 1, averageSize, rate1)
    let rate0 = getAverageRate(data, 2, 0, averageSize, false)

    if (!rate0 || !rate1 || !rate01) {
        console.log(`Something wrong with rate calculation r0:${rate0} r1:${rate1} r01:${rate01}`)
        return false
    }

    let amount1 = averageSize / rate1
    let amount01 = amount1 / rate01
    let amount0 = amount01

    let total1 = rate1 * amount1
    let total01 = rate01 * amount01
    let total0 = rate0 * amount0

    let result1 = amount1 - total01
    let result0 = amount01 - amount0
    let resultUSDT = total0 - total1

    let profit = result1 * rate1 + result0 * rate0 + resultUSDT

    let result = {
        'type': 'desc',
        'profit': profit,
        'rate0': rate0,
        'rate1': rate1,
        'rate01': rate01,
        'time': Date.now()
    }

    return result
}

function ascending (data, averageSize) {
    let rate0 = getAverageRate(data, 0, 2, averageSize, false)
    let rate1 = getAverageRate(data, 2, 1, averageSize, false)
    let rate01 = getAverageRate(data, 1, 0, averageSize, rate1)

    if (!rate0 || !rate1 || !rate01) {
        console.log(`Something wrong with rate calculation r0:${rate0} r1:${rate1} r01:${rate01}`)
        return false
    }

    let amount0 = averageSize / rate0
    let amount01 = amount0
    let amount1 = amount01 * rate01

    let total0 = rate0 * amount0
    let total1 = rate1 * amount1
    let total01 = rate01 * amount01

    let result0 = amount0 - amount01
    let result1 = total01 - amount1
    let resultUSDT = total1 - total0

    let profit = result0 * rate0 + result1 * rate1 + resultUSDT

    let result = {
        'type': 'asc',
        'profit': profit,
        'rate0': rate0,
        'rate1': rate1,
        'rate01': rate01,
        'time': Date.now()
    }

    return result
}

module.exports = (data, averageSize) => {
    let ascResult = ascending(data, averageSize)
    let descResult = descending(data, averageSize)
    if (ascResult && descResult) {
        return (ascResult.profit > descResult.profit) ? ascResult : descResult
    } else {
        return false
    }
}