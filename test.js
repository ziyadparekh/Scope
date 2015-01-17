'use strict'

var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello 1028\n');
}).listen(1028);

console.log("Server running at http://127.0.0.1:8125");

process.on('uncaughtException', function(err){
    console.log(err);
    process.exit(0);
});

