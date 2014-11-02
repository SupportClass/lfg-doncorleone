var express = require('express');
var app = module.exports = express();
var io = require('../../server.js');
var squirrel = require('squirrel');
var events = require('events'); //needed for barry-donations event listening
var config = require('../../lib/config');
var fs = require('fs');
var cachedTotals = null;

var cfgPath = __dirname + '/config.json';
if (!fs.existsSync(cfgPath)) {
    throw new Error('[eol-doncorleone] config.json was not present in bundles/eol-doncorleone, aborting!');
}
var bdConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

var bd = null;
squirrel('barry-donations', function barryDonationsLoaded(err, BarryDonations) {
    bdConfig.hostname = config.host;
    bd = new BarryDonations(bdConfig);
    bd.on('initialized', initialized);
    bd.on('newdonations', gotDonations);
});

function initialized(data) {
    console.log('[eol-doncorleone] Listening for donations to', bd.username);
    cachedTotals = data.totals;
    io.sockets.json.send({
        bundleName: 'eol-doncorleone',
        messageName: 'initialized',
        content: cachedTotals
    });
}

function gotDonations(data) {
    cachedTotals = data.totals;
    io.sockets.json.send({
        bundleName: 'eol-doncorleone',
        messageName: 'donations',
        content: cachedTotals
    });
}

io.sockets.on('connection', function (socket) {
    socket.on('message', function (data, fn) {
        if (data.bundleName !== 'eol-doncorleone') {
            return;
        }

        if (data.messageName === 'getTotals') {
            fn(cachedTotals);
        }

        if (data.messageName === 'resetCategory') {
            bd.resetCategory(data.content);
        }
    });
});