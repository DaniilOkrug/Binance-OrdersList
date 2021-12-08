const config = require('./config.json');

const express = require('express');
const app = express();
const port = 3000;

const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: config.key,
    APISECRET: config.secretkey
});

app.get('/', function (req, res) {
    (async () => {
        const openOrders = await binance.futuresOpenOrders();
        const positions = await binance.futuresPositionRisk();
        positions.filter((position) => { return position.positionAmt > 0 });
        res.send({
            orders: openOrders,
            positions: positions
        })
    })();
});

app.listen(port, function () {
    console.log(`Listening on port ${port}!`)
});