let http=require('http');
http.createServer(function(req,res){
	console.log(req.url);
	console.log(req.method);
	console.log(req.headers);
	res.writeHead(200,{
		'content-type': 'application/json'
	});
	let data={ mydata: "zdlfkbnasdlfgn", a: 0 }
	res.end(JSON.stringify(data))
	//res.end();
}).listen(8000);