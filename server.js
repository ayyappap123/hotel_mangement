process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// Include Modules
const exp = require('express');
const path = require('path');

const config = require('./configs/configs');
const express = require('./configs/express');
const mongoose = require('./configs/mongoose');

global.appRoot = path.resolve(__dirname);

db = mongoose();
const app = express();

app.get('/', (req, res, next) => {
    res.send('hello world');
});

/* Old path for serving public folder */
app.use('/', exp.static(__dirname + '/public'));

// Listening Server
app.listen(parseInt(config.serverPort), async () => {
    console.log('process.env.NODE_ENV', process.env.NODE_ENV);
    console.log(`Server running at http://localhost:${config.serverPort}`);
});