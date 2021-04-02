module.exports = (currencyData, want2Buy, buyWith) => {
    let data = currencyData[want2Buy][buyWith]
    let rate = parseFloat(Object.keys(data)[0])
    return rate
}