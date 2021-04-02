const symbols = [
    'ETH',
    'BTC',
    'USDT'
]

const symbolsDown = [
    symbols[0] + 'DOWN',
    symbols[1] + 'DOWN'
]

const symbolsUp = [
    symbols[0] + 'UP',
    symbols[1] + 'UP'
]
//------------------------------------------------------------------------------//

const pair0 = symbols[0] + 'USDT'
const pair1 = symbols[1] + 'USDT'
const pair01 = symbols[0] + symbols[1]

const pairDown0 = symbolsDown[0] + 'USDT'
const pairDown1 = symbolsDown[1] + 'USDT'

const pairUp0 = symbolsUp[0] + 'USDT'
const pairUp1 = symbolsUp[1] + 'USDT'

//trading minmum and digit
//bnb btc usdt 3 6 2
//bnb eth usdt 3 2 6
//eth btc usdt 6 6 6
//enj eth usdt 5 6 8
const lotSize = {
    pair0: 3,
    pair1: 6,
    pair01: 2
}

//rate min digit
const minRate = {
    pair0: 4,
    pair1: 2,
    pair01: 7
}

module.exports = {
    symbols,
    symbolsDown,
    symbolsUp,
    pair0,
    pair1,
    pair01,
    pairDown0,
    pairDown1,
    pairUp0,
    pairUp1,
    //lotSize,
    //minRate
}