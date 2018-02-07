const express = require('express');
const morgan = require('morgan'); //another useful library for NODE.js
const app = express();
const bodyParser = require('body-parser');

// -- Setting Morgan and Body Parser --

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//++ Add in access-control & such


// -- Routes that can be accessed --

const editDataRoutes = require('./api/routes/edit');
const accessDataRoutes = require('./api/routes/access');

app.use('/edit', editDataRoutes);
app.use('/access', accessDataRoutes);

// -- Thrown Errors in case it is not picked up by fields above --

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
})

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

//const API_KEY = fs.readFileSync("./ExchangeKeys.txt").toString(); //This is your API key

module.exports = app;
