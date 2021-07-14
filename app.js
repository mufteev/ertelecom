const path = require('path');
const http = require('http');
const logger = require('morgan');
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');

var logg = log4js.getLogger();
logg.level = 'debug'; // default level is OFF - which means no logs at all.
logg.debug('Some debug messages');

log4js.configure({
  appenders : {
    cheeseLogs: { type: 'file', filename: 'logs/error.log' },
    console   : { type: 'console' }
  },
  categories: {
    default: { appenders: ['console', 'cheeseLogs'], level: 'error' }
  }
});
const loggerError = log4js.getLogger();
console.error = (e) => loggerError.error(e);

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
