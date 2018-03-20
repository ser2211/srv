var express = require('express')
var app = express()
var fs = require('fs')

app.use("/snake", express.static(__dirname + "/snake"));
app.get('/score', function (req, res) {
	fs.readFile('records.json', (err, data) => {
	  if (err) throw err;
	  res.send(JSON.parse(data));
	});
	
})

app.listen(3000)