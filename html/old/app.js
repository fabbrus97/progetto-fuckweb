http = require('http');

http.createServer(function (request, response) {

 response.writeHead(200, {'Content-Type': 'text/plain'});

response.end('oh oh oh Hello World\n');

}).listen(8000);

console.log('Running...');
