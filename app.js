var express = require('express');
var morgan = require('morgan'); //another useful library for NODE.js
var port = process.env.PORT || 8888;
var app = express();
var bodyParser = require ('body-parser');

app.use(morgan('dev'));


// Very basic example of app.get (URL, function (requestObject, responseObject))
// app.get ('/', function (req, res)
// {
//   res.sendFile(__dirname + '/home.html');
// });

// This is example code from a previous project where I'm interfacing with MongoDB (your interfacing with CCXT will be similar — I'm not exactly familiar with that). You may need to end up using nested callback functions as implemented below to avoid async problems.

// app.get ('/results', function (req, res)
// {
//   var courses = [];
//   MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var cursor = db.collection('courses').find();
//     cursor.forEach
//     ( function (doc)
//       {
//         courses.push (doc.name);
//       },
//       function (err, doc)
//       {
//         if (err) throw err;
//         res.render ('chooseResults', {courses: courses});
//       }
//     );
//   });
// });
