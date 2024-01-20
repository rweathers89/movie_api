const express = require('express'),
  morgan = require('morgan');

const app = express();

app.use(morgan('common'));

app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});//end app.get

app.get('/movies', (req, res) => {
  res.json()
});//end app.get /movies

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening to port 8080.')
});//end app.listen



/*const http = require('http'),
    url = require('url');

http.createServer((request, response) => {
  let requestURL = url.parse(request.url, true);
  if (request.url.pathname == '/documentation.html') {
    response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Documentation on the bookclub API.\n');
  } else {
    response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Welcome to my book club!\n');
  }
  
}).listen(8080);
*/

console.log('My first Node test server is running on Port 8080.');