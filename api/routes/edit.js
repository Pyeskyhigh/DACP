const express = require('express');
const router = express.Router();

// -- Different paths for choosing the order in which the data should be organized --

router.get('/order/exchange/alphabetical', (req, res, next) => {  //This is the default order
  res.status(200).json({
    message: 'You have chosen to order data alphabetically by exchange'
  });
});

router.get('/order/exchange/holding', (req, res, next) => {
  res.status(200).json({
    message: 'You have chosen to order exchanges by alphabetical'
  });
});

router.get('/order/asset/alphabetical', (req, res, next) => {
  res.status(200).json({
    message: 'You have chosen to order data alphabetically by assets'
  });
});

router.get('/order/asset/holding', (req, res, next) => {
  res.status(200).json({
    message: 'You have chosen to order data by the size of holdings of assets'
  });
});

router.get('/order/transaction/chronological', (req, res, next) => {
  res.status(200).json({
    message: 'You have chosen to order data by transactions in chronological order'
  });
});

// -- Returns a JSON holding status of data --

router.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Returning the status of your data...'
  });
});

// -- Put Requests help add exchanges to the data --

router.put('/:exchangeName', (req, res, next) => {
  const exName = req.params.exchangeName;
  res.status(200).json({
    message: exName + ' was added to your list'
  });
});

// -- Delete Requests help delete exchanges from list

router.delete('/:exchangeName', (req, res, next) => {
  const exName = req.params.exchangeName;
  if (exName === 'all') {
    res.status(200).json({
      message: 'Cleared all exchanges from your list'
    });
  } else
    res.status(200).json({
      message: exName + ' was deleted from your list'
  });
});


module.exports = router;
