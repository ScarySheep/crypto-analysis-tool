//data - bids or asks for specific currencies
//size of the average
//rateUSDT is the data's rate to USDT if needed
module.exports = (currencyData, want2Buy, buyWith, averageSize, rateUSDT) => {
    let data = currencyData[want2Buy][buyWith]
    let dataLength = Object.keys(data).length
    let index = 0
    let totalAmount = 0
    if (rateUSDT) {
        averageSize = averageSize / rateUSDT
    }
    let tmpAverageSize = averageSize
    while (index < dataLength) {
        let rate = parseFloat(Object.keys(data)[index])
        let amount = data[Object.keys(data)[index]]
        let order = amount * rate

        if (averageSize >= order) {
            averageSize -= order
            totalAmount += amount
        } else {
            totalAmount += averageSize / rate
            return tmpAverageSize / totalAmount
        }
        index++
    }
    console.log('averageRate : exceed data limit with this average size')
    return false
}