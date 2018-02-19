// "use strict";
const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const ccxt = require('ccxt');
require('dotenv').config();

// -- Setting Morgan and Body Parser --

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var myTrades = {};
var myExchanges = ["bitfinex"]; // Add to list as you go along

getAllMyTrades();

async function getAllMyTrades () {
  for (var i = 0; i < myExchanges.length; i++) {
    var currentExchange = myExchanges [i];
    console.time(`Getting My ${currentExchange} Trades`);
    var currentExchangeTrades = await getMyTrades (currentExchange);
    console.timeEnd(`Getting My ${currentExchange} Trades`);

    myTrades [currentExchange] = currentExchangeTrades;
  }
}

function isFunctionalityPossible (exchange, functionName) {
  console.log(exchange.has[functionName]);
}

async function getMyTrades (exchangeName) {
  let exchange = new ccxt [exchangeName] ({
    apiKey: eval(`process.env.` + exchangeName + `_apiKey`),
    secret: eval(`process.env.` + exchangeName + `_secret`)
  });

  var rateLimit = exchange.rateLimit;
  console.log(rateLimit);
  // await sleep (rateLimit);
  exchange.loadMarkets();
  await sleep (rateLimit);
  // let symbols = await exchange.symbols;
  let symbols = exchange.symbols;
  console.log(symbols.length);
  // let numberOfAttempts = 0;
  let trades = [];
  var loopCounter = 0;
  var errorCounter = 0;
  while (symbols.length > 0) {

    try {
      // await getUserTrades (exchange, symbols, rateLimit);
      for (var i = 0; i < symbols.length; i++) {
        await sleep (rateLimit); // makes sure that you don't exceed the rate limit of calls to the API
        let currentSymbol = symbols[i];
        let currentTrades = await exchange.fetchMyTrades(symbol = currentSymbol);
        if (currentTrades.length === 0) {
          let index = symbols.indexOf (currentSymbol);
          symbols.splice (index, 1);
          // numberOfAttempts += 1;
          console.log ("Empty");
        }
        else {
          trades.push (currentTrades);
          let index = symbols.indexOf (currentSymbol);
          symbols.splice (index, 1);
          // numberOfAttempts += 1;
          console.log(`Length of trades is ${trades.length}`);
        }
        console.log(`Length of symbols is ${symbols.length}`);
      }
    }
    catch (e) {
      errorCounter++;
      console.log("--------------------");
      console.log(`Error ${errorCounter}`);
      console.log(e);
      console.log("--------------------");
      let errorSleepTime = 30000; // in ms
      await sleep (errorSleepTime);
    }

    loopCounter += 1;
  }

  return trades;
}

// async function getUserTrades (exchange, symbols, rateLimit) {
//   for (var i = 0; i < symbols.length; i++) {
//     await sleep (rateLimit); // makes sure that you don't exceed the rate limit of calls to the API
//     let currentSymbol = symbols[i];
//     let currentTrades = await exchange.fetchMyTrades(symbol = currentSymbol);
//     if (currentTrades.length === 0) {
//       let index = symbols.indexOf (currentSymbol);
//       symbols.splice (index, 1);
//       // numberOfAttempts += 1;
//       console.log ("Empty");
//       console.log(`Length of symbols is ${symbols.length}`);
//     }
//     else {
//       trades.push (currentTrades);
//       let index = symbols.indexOf (currentSymbol);
//       symbols.splice (index, 1);
//       // numberOfAttempts += 1;
//       console.log (currentTrades);
//     }
//   }
// }

async function sleep (duration) { // duration is in milliseconds
  return new Promise (resolve => setTimeout (resolve, duration));
}
