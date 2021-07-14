const path = require('path');
const http = require('http');
const logger = require('morgan');
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');

dotenv.config({
  path: './config.env'
});

const app = express();
const server = http.createServer(app);


const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

const index = require('./routes');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', index);

app.use((req, res) => {
  res.status(404).send('Ресурс не найден [File not found]');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${ hostname }:${ port }`);
});
