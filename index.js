'use strict';

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

module.exports = function(nodecg) {
    squirrel('barry-donations', function barryDonationsLoaded(err, BarryDonations) {
        bdConfig.hostname = config.host;
        bd = new BarryDonations(bdConfig);
        bd.on('initialized', initialized);
        bd.on('newdonations', gotDonations);
    });

    function initialized(data) {
        console.log('[eol-doncorleone] Listening for donations to', bd.options.username);
        cachedTotals = data.totals;
        nodecg.sendMessage('initialized', cachedTotals);
    }

    function gotDonations(data) {
        cachedTotals = data.totals;
        nodecg.sendMessage('donations', cachedTotals);
    }

    nodecg.listenFor('getTotals', function getTotals(data, cb) {
        cb(cachedTotals);
    });

    nodecg.listenFor('resetCategory', function resetCategory(data, cb) {
        bd.resetCategory(data.content);
    });
};