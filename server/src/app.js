const keypress = require('keypress');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const pusherCredentials = require('./credentials/pusher')
const Pusher = require('pusher');
const binanceWebsocket = require('./binanceWebsocket')
const algorithms = require('./algorithms/main')
const currencies = require('./currencies')


const pusher = new Pusher({
    appId: pusherCredentials.appId,
    key: pusherCredentials.key,
    secret: pusherCredentials.secret,
    cluster: pusherCredentials.cluster,
    useTLS: true
});

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

app.post('/register', (req, res) => {
    res.send({
        message: `Hello ${req.body.email}!`
    })
})

binanceWebsocket.init(updateChart)
function updateChart (charts) {
    pusher.trigger("charts", "candlecharts", charts)
}

app.post('/charts', (req, res) => {
    let charts = binanceWebsocket.charts
    if (charts[0] == null || charts[1] == null) {
        res.send(false)
    } else {
        res.send(charts)
    }
})

app.post('/currencies', (req, res) => {
    res.send(currencies)
})

app.post('/parameters', (req, res) => {
    res.send(algorithms.parameters)
})

algorithms.start(indicator, trend)
function indicator (value) {
    if (value) {
        pusher.trigger("charts", "indicators", value)
    } else {
        console.log("Something wrong with indicators")
    }
}

function trend (value) {
    if (value) {
        pusher.trigger("charts", "trends", value)
    } else {
        console.log("Something wrong with trend")
    }
}

app.listen(process.env.PORT || 8081)


//detects cmd keypress
keypress(process.stdin);

process.stdin.on('keypress', function (ch, key) {
    console.log('got "keypress"', key);
    if (key.name == 'q') {
        algorithms.stop()
    }
})