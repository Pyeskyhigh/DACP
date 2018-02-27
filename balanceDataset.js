// DACP Library
// Follow the instructions on the Github Page to generate the Dataset

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

// List of the User Exchanges
var myExchanges = [];

// Calls all Functions
(async () => {
  console.log("----------");
  console.log('Path of Coins to USD: ')
  var dataset = await setDataset();
  console.log("----------");
  console.log(dataset)
  console.log("----------");
  console.log(dataset.exchanges[0])
  console.log(dataset.exchanges[1])
  console.log("----------");
}) ();

// Creates the dataset of balances with all exchanges
async function setDataset(){
  var balanceDataset = {};
  balanceDataset.exchanges = []
  for (var i = 0; i < myExchanges.length; i++){
    balanceDataset.exchanges.push(await setExchangeData(myExchanges[i]));
  }
  return balanceDataset;
}

// Takes balances and prices from an exchange
async function setExchangeData(exchangeName){

    // Set up Exchange
    let exchange = new ccxt [exchangeName] ({
      apiKey: eval(`process.env.` + exchangeName + `_apiKey`),
      secret: eval(`process.env.` + exchangeName + `_secret`)
    });

    // Set up JSON
    var dataset = {};
    dataset.name = exchangeName;
    dataset.coins = [];

    var errorCounter = 0;
    var exchangeHoldings = await findHoldings(exchange);
    var rateLimit = exchange.rateLimit;
    await sleep (rateLimit);

    //Set Balance for each coin in exchange
    for(var i = 0; i < exchangeHoldings.length; i++){
      try {
        await sleep (rateLimit);
        var balanceOfCoin = await findBalance(exchange, exchangeHoldings[i]);
        var balanceInUSD = 0;
        if(exchangeHoldings[i] === 'USD')
        {
          console.log(['USD']);
          balanceInUSD = balanceOfCoin;
        }
        else {
          balanceInUSD = balanceOfCoin * await findPriceUSD(exchange, exchangeHoldings[i]);
        }

        var coin = {};
        coin.name = exchangeHoldings[i];
        coin.balanceInCurrency = balanceOfCoin;
        coin.balanceInUSD = balanceInUSD;

        dataset.coins.push(coin);
      }
      catch (e) {
        errorCounter++;
        console.log("--------------------");
        console.log(`Error ${errorCounter}`);
        console.log(e);
        console.log("--------------------");
        console.log('Please Wait...')
        let errorSleepTime = 20000; // in ms
        await sleep (errorSleepTime);
        i--; //Restart
      }
    }
  return dataset;
}

// Finds the holdings in that single exchange
async function findBalance(exchange,coinName){

    var balance = await exchange.fetchBalance()
    var totalBalance = balance.total;
    return totalBalance[coinName]; // Delete coinName to get all
}

// Finds the balances in that single exchange
async function findHoldings(exchange){
    var balance = await exchange.fetchBalance()
    var coinHoldings = Object.keys(balance.total)
    return coinHoldings;
}

// Gets the last price it was sold at on specific Symbol.
async function findPriceAtSymbol(exchange, market){
  var ticker = await exchange.fetchTicker(market);
  return ticker.last;
}

// Finds the symbols offered by certain exchange
async function findSymbols(exchange){
  var market = await exchange.fetchMarkets();
  symbolsOffered = [];
  for (var i = 0; i < market.length; i++){
    symbolsOffered.push(market[i].symbol);
  }
  return symbolsOffered;
}

// Finds path to get the price of the coin in USD on exchange
async function findPriceUSD(exchange, coinName){

  //Preset the Bitfinex access
  let bitfinexExchange = new ccxt ['bitfinex'] ({
    apiKey: eval(`process.env.` + 'bitfinex' + `_apiKey`),
    secret: eval(`process.env.` + 'bitfinex' + `_secret`)
  });

  path = [];
  symbol = coinName + '/USD';
  allSymbols = await findSymbols(exchange);
  found = false;

  // If the asset is USD (Should check if in other currency as well)
  if(coinName === 'USD'){ // Should not be necessary
    path.push('USD');
    return await findBalance(exchange, 'USD');
  }

  //Checks if there is a connection straight to USD
  for(var i = 0; i < allSymbols.length; i++){
    if(symbol === allSymbols[i])
    {
      found = true;
      path.push(symbol);
      console.log(path)
      return await findPriceAtSymbol(exchange, symbol);
    }
  }

  // if Not, checks for BTC or ETH connection
  if(!found){

    // Check for BTC connection
    if(coinName != 'BTC'){
      symbol = coinName + '/BTC';
    }
    else {
      found = true; // If BTC, goes to next step to be tested on Bitfinex
    }

    for(var i = 0; i < allSymbols.length; i++){
      if(symbol === allSymbols[i]){
        found = true;
        path.push(symbol);
      }
    }

    // Find if there is a USD connection from BTC
    foundBTCPath = false;
    if(found){

      // Look for BTC path to USD in exchange
      for(var i = 0; i < allSymbols.length; i++){
        if('BTC/USD' === allSymbols[i])
        {
          foundBTCPath = true;
          path.push(symbol);
          var price = await findPriceAtSymbol(exchange, symbol) *
                      await findPriceAtSymbol(exchange, 'BTC/USD');
          console.log(path)
          return price;
        }
      }

      // Look for BTC path to USD in Bitfinex
      if(!foundBTCPath){
        BTCUSDprice = await findPriceAtSymbol(bitfinexExchange, 'BTC/USD'); //Check, May need to change the 'bitfinex thing'
        path.push('BTC/USD @ Bitfinex');
        foundBTCPath = true;
        var price = 0;

        // if BTC, only compare to other exchange, if anything else, take into account the coin/BTC.
        if(coinName === 'BTC')
          price = await findPriceAtSymbol(bitfinexExchange, 'BTC/USD'); //Check, May need to change the 'bitfinex thing'
        else{
          price = await findPriceAtSymbol(exchange, symbol) *
                    await findPriceAtSymbol(bitfinexExchange, 'BTC/USD'); //Check, May need to change the 'bitfinex thing'
        }
        console.log(path)
        return price;
      }
    }
    else{ // Meaning if no connection to BTC, check for ETH connection
      if(coinName != 'ETH')
        symbol = coinName + '/ETH';
      else
        found = true; // If ETH, goes to next step to be tested on Bitfinex

      for(var i = 0; i < allSymbols.length; i++){
        if(symbol === allSymbols[i]){
          found = true;
          path.push(symbol);
        }
      }

      foundETHPath = false;
      if(found){

        // Look for BTC path to USD in exchange
        for(var i = 0; i < allSymbols.length; i++){
          if('ETH/USD' === allSymbols[i])
          {
            foundETHPath = true;
            path.push(symbol);
            var price = await findPriceAtSymbol(exchange, symbol) *
                        await findPriceAtSymbol(exchange, 'ETH/USD');
            console.log(path)
            return price;
          }
        }

        // Look for BTC path to USD in Bitfinex
        if(!foundETHPath){
          ETHUSDprice = await findPriceAtSymbol(bitfinexExchange, 'ETH/USD');
          path.push('ETH/USD @ Bitfinex');
          foundETHPath = true;

          if(symbol === 'ETH')
            price = await findPriceAtSymbol(bitfinexExchange, 'ETH/USD')
          else{
            price = await findPriceAtSymbol(exchange, symbol) *
                      await findPriceAtSymbol(bitfinexExchange, 'ETH/USD');
          }
          console.log(path)
          return price;
        }
      }

      if(!foundETHPath){
        console.log("Connection could not be found")
        return -1;
      }
    }
  }
  console.log(path)
}

// Sleeps for certain duration of time set in milliseconds
async function sleep (duration) {
  return new Promise (resolve => setTimeout (resolve, duration));
}

// Goes through all exchanges and finds holdings (coin types)
async function getTotalHoldings() {
  allHoldings.exchanges = []
  for (var i = 0; i < myExchanges.length; i++){
    let exchange = new ccxt [myExchanges[i]] ({
      apiKey: eval(`process.env.` + exchangeName + `_apiKey`),
      secret: eval(`process.env.` + exchangeName + `_secret`)
    });

    var exchangeBalance = await findHoldings(exchange);
    exchangeInfo = {};
    exchangeInfo.name = myExchanges[i]
    exchangeInfo.holdings = exchangeBalance;
    allHoldings.exchanges.push(exchangeInfo);
  }
}; // For this to work, fix input of methods

// Goes through all exchanges and finds balance (coin and total)
async function getTotalBalances() {
  allBalances.exchanges = [];
  for (var i = 0; i < myExchanges.length; i++){
    let exchange = new ccxt [myExchanges[i]] ({
      apiKey: eval(`process.env.` + exchangeName + `_apiKey`),
      secret: eval(`process.env.` + exchangeName + `_secret`)
    });
    var exchangeBalance = await findBalance(exchange);
    exchangeInfo = {}
    exchangeInfo.name = myExchanges[i];
    exchangeInfo.balances = exchangeBalance;
    allBalances.exchanges.push(exchangeInfo)
  }
};
