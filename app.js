//Initalization of variables for server
var express = require('express');
var bodyParser = require("body-parser");
var weather = require('openweather-apis');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
weather.setLang('en');
weather.setUnits('metric');
weather.setAPPID("46a7edb5f7f2d6b5359b2184ff22ec29");

const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBE7bs-amwZHzzrBwK7s4HJkwU8D7J7R7A'
});
var app = express();
app.use(bodyParser.urlencoded({ limit:'10mb',extended: true }));
app.use(bodyParser.json({limit:'10mb',extended:true}));

//POST to call Google direcrtions API and get response
app.post('/', function(req, res){
    var source = req.body.source;
    var destination = req.body.destination;
    	googleMapsClient.directions({
  			origin: source,
        	destination: destination,
        	mode: 'driving'
		}, function(err, response) {
  	if (!err) {
    	res.send(response.json);
  	}
	});
});
//POST to call Open Weathermap API and get response
app.post('/weather', function(req, res){

  //console.log(String(req.body.lat));
  weather.setCoordinate(req.body.lat, req.body.long);
  weather.getDescription(function(err, description){
       if(!err){
        res.send(description);
      }
    });

});
//POST to insert data into the database
app.post('/insert', function(req, res){

  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("test");
  console.log(req.body);
  var myobj = req.body;
  dbo.collection("directiondb").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();
    });
  });
  res.send("document inserted");
});
//POST to check if entry is in database
app.post('/check', function(req,res){

  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("test");
  var query = { source: req.body.source, destination: req.body.destination };
  dbo.collection("directiondb").find(query).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
    db.close();
  });

});
});
const host = '0.0.0.0';
const port = process.env.PORT || 8000;
app.listen(port, host, function() {
  console.log("Server has started.......");
});