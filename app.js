const path = require('path');
const http = require('http');
const dotenv = require('dotenv');
const compression = require('compression');
const express = require('express');
const log4js = require('log4js');
const routes = require('./routes');

log4js.configure({
  appenders : {
    error  : { type: 'file', filename: 'logs/error.log' },
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['console', 'error'], level: 'error' }
  }
});
const loggerError = log4js.getLogger();
console.error = (e) => loggerError.error(e);

dotenv.config({
  path: './config.env'
});
const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

const app = express();
const server = http.createServer(app);

app.use(compression());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: false }));

app.use('/api', routes);

app.use(express.static(path.join(__dirname, 'client/build')));
app.get('/*', (req, res, next) => {
  res.setHeader('Last-Modified', new Date().toUTCString());
  next();
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/routes.html'));
});


app.use((req, res) => {
  res.status(404).send('Ресурс не найден [File not found]');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${ hostname }:${ port }`);
});
