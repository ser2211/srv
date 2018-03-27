var express = require('express')
var app = express()
var fs = require('fs')
var bodyParser = require('body-parser')

app.use(express.static(__dirname + "/snake"))
app.use(bodyParser.urlencoded());
app.get('/score', function (req, res) {
	fs.readFile('records.json', (err, data) => {
	  if (err) throw err;
	  res.send(JSON.parse(data));
	});
	
})

app.post('/myscores', function (req, res) {
	//console.log(req.body);
	fs.readFile('records.json', (err, data) => {
	  if (err) throw err;
	  let mydata = JSON.parse(data);
	  let highScores = 0;
	  //console.log(req.body);
	  user = req.body;
	  if (user.name in mydata) {
	  	highScores = mydata[user.name];
	  }
	  else {
	  	mydata[user.name] = 0;
	  	highScores = mydata[user.name];
	  }
	  console.log(mydata);
	  res.send({score: highScores});
	});

})

app.post('/savescores', function (req, res) {
	//console.log(req.body);
	var json;
	fs.readFile('records.json', (err, data) => {
	  if (err) throw err;
	  let mydata;
	  try {
	  	console.log('file: ', data)
	  	mydata = JSON.parse(data);
	  }
	  catch (e) {
	  	mydata = {};
	  }
	  console.log(mydata);
	  let highScores = 0;
	  let newScore = 0;
	  //console.log(req.body);
	  user = req.body;
	  if (user.name in mydata) {
	  	highScores = mydata[user.name];
	  	newScore = user.score;
	  	if (newScore > highScores) mydata[user.name] = newScore;
	  }
	  else {
	  	mydata[user.name] = 0;
	  	highScores = mydata[user.name];
	  }
	  console.log(mydata);
	  //res.send({score: highScores});
	  json = JSON.stringify(mydata);
	  console.log(json);
	  //fs.writeFileSync('records.json', json, 'utf8');
	  fs.writeFile('records.json', json);
	});
	
})

app.listen(3000)