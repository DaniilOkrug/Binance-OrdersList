const config = require('./config.json');

const express = require('express');
const app = express();
const port = 3002;

const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: config.key,
    APISECRET: config.secretkey,
    recvWindow: 60000,
    useServerTime: true
});

// const binance = new Binance().options({
//     APIKEY: 'XNEkVUXJXXBUD74lqmz0goCtRVe1iXgCNELvBnPmPhBkjkHIxa4D1gh4cR4isJSM',
//     APISECRET: 'J07jhkJqKb8vs8LDM1Yu3i4VSGeHVIFdP5InvTo4oMiU9IscbpcCu7XKLm6x4a8K'
// });

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

// server.listen(port, (error) => {
//     if (error) return console.log(`Error: ${error}`);
//     console.log(`Server is listening on port ${port}`)
// })

(async () => {
    binance.websockets.userData(
        data => {
            console.log('callback');
            console.log(data);
        },
        data => {
            console.log('exec');
            console.log(data);
        },
        data => {
            console.log('sub');
            console.log(data);
        },
        data => {
            console.log('list');
            console.log(data);
        });

    setInterval(async () => {
        const balances = (await binance.balance());
        const assets = Object.keys(balances);
        console.log('Balances: ');
        assets.forEach(asset => {
            if (balances[asset].available != 0) console.log(`   ${asset}: ${balances[asset].available}`)
        });

        console.log('openOrders:');
        binance.openOrders(false, (error, openOrders) => {
            openOrders.forEach(order => {
                console.log(`   ${order.type} ${order.side} ${order.symbol} ${order.origQty} at ${order.price}`);
            });
        });

        console.log('\n');
    }, 3000);
})();

(async () => {
    // binance.marketSell('IDEXBUSD', 210.5).catch((err) => console.log(err.body))
    // binance.marketSell('ADABUSD', 13);

    // await binance.cancelAll("IDEXBUSD");
    // await binance.cancelAll("ADABUSD");
})();

(async () => {

    binance.websockets.userFutureData(console.log(), console.log(), async (updateInfo) => {
        console.log(updateInfo.order);
    });

    // console.log(await binance.futuresMarketBuy('XRPUSDT', 0.3, {       
    //     reduceOnly: 'true'
    // }));
    // console.log(await binance.futuresMarketBuy('ETHUSDT', 0.034 ));

    // console.log(await binance.futuresBuy('XRPUSDT', 10, 0.9175));
    // console.log(await binance.futuresBuy('FTMUSDT', 5, 2.3533 ));
    // console.log(await binance.futuresSell('XRPUSDT', 7, 1.558));

    // console.info( await binance.futuresOpenOrders() );

    // await binance.futuresCancelAll('FTMUSDT');
    setInterval(async () => {
        let profit = 0;

        const balances = await binance.futuresBalance();
        balances.forEach((balance) => {
            if (balance.asset == 'USDT') console.log('Balance USDT: ' + balance.balance);
        });

        console.log('Open orders');
        const openOrders = await binance.futuresOpenOrders();
        openOrders.forEach((order) => {
            console.log(`   Order -> ${order.symbol} ${order.type} ${order.price} ${order.origQty}`);
        });

        console.log('Positions');
        const positions = (await binance.futuresPositionRisk()).filter((position) => { return position.positionAmt != 0 });
        positions.forEach((position) => {
            profit += Number(position.unRealizedProfit);
            console.log(`   position -> ${position.symbol} ${position.positionAmt} ${position.unRealizedProfit}`);

        });

        console.log('Profit: ' + profit);

        // console.log('Subscribtions: ');
        // console.log();
    }, 5000);
});