/****************************
    MONGOOSE SCHEMAS
****************************/
const config = require('./configs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const mongoDBOptions = {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    keepAlive: 1,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useFindAndModify: false,
    native_parser: true,
    poolSize: 5
}

module.exports = function () {
    const db = mongoose.connect(config.db, mongoDBOptions).then(
        (connect) => { console.log('MongoDB connected') },
        (err) => { console.log('MongoDB connection error', err) }
    );
    mongoose.set('useCreateIndex', true);
    return db;
};