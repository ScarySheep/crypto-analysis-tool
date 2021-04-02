const getRate = require('./getRate')
const currencies = require('./currencies')

let allPass = [0, 0, 0]

let checkOrderConsole = false

function log (finished, want2Buy, buyWith, orderRate, currentRate) {
    let pairStr = currencies.currencies[want2Buy] + currencies.currencies[buyWith]
    if (checkOrderConsole) {
        if (finished) {
            console.log(`Order: ${pairStr} rate: ${orderRate} finished`)
        } else {
            console.log(`Unfinished order: ${pairStr} rate: ${orderRate}`)
        }
        console.log(`Current rate is ${currentRate}`)
    }

}

module.exports.reset = () => {
    allPass = [0, 0, 0]
}


module.exports.verify = (activeOrder, data) => {
    //observe market to see if order can be fulfilled
    /*asc example
    usdt -> bnb
    I have the highest price in a "descending buy order list"
    and I want to check if the lowest price in a "ascending sell order list" is gonna to be lower than my price*/
    //new way
    //check if same limit order is lower or higher
    if (checkOrderConsole) {
        console.log(activeOrder.type)
    }
    if (activeOrder.type == 'asc') {
        if (!allPass[0]) {
            if (getRate(data, 0, 2) < activeOrder.rate0) {
                //order fulfilled
                allPass[0] = 1
            }
            log(allPass[0], 0, 2, activeOrder.rate0, getRate(data, 0, 2))
        }
        if (!allPass[1]) {
            if (getRate(data, 2, 1) > activeOrder.rate1) {
                //order fulfilled
                allPass[1] = 1
            }
            log(allPass[1], 2, 1, activeOrder.rate1, getRate(data, 2, 1))
        }
        if (!allPass[2]) {
            if (getRate(data, 1, 0) > activeOrder.rate01) {
                //order fulfilled
                allPass[2] = 1
            }
            log(allPass[2], 1, 0, activeOrder.rate01, getRate(data, 1, 0))
        }

    } else {
        if (!allPass[0]) {
            if (getRate(data, 2, 0) > activeOrder.rate0) {
                //order fulfilled
                allPass[0] = 1
            }
            log(allPass[0], 2, 0, activeOrder.rate0, getRate(data, 2, 0))
        }

        if (!allPass[1]) {
            if (getRate(data, 1, 2) < activeOrder.rate1) {
                //order fulfilled
                allPass[1] = 1
            }
            log(allPass[1], 1, 2, activeOrder.rate1, getRate(data, 1, 2))
        }

        if (!allPass[2]) {
            if (getRate(data, 0, 1) < activeOrder.rate01) {
                //order fulfilled
                allPass[2] = 1
            }
            log(allPass[2], 0, 1, activeOrder.rate01, getRate(data, 0, 1))
        }

    }
    let passes = allPass[0] + allPass[1] + allPass[2]
    if (passes == 3) {
        return 'allPass'
    } else if (passes == 1 || passes == 0) {
        return 'unknown'
    } else {
        if (!allPass[2]) {
            //don't want to stuck in a loop
            //so do this for now
            return 'allPass'
        }
        if (!allPass[0]) {
            return activeOrder.type + currencies.currencies[0]
        }
        if (!allPass[1]) {
            return activeOrder.type + currencies.currencies[1]
        }
    }
}