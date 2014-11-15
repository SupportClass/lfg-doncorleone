'use strict';

var log = require('../../lib/logger');
var squirrel = require('squirrel');
var fs = require('fs');

var cfgPath = __dirname + '/config.json';
if (!fs.existsSync(cfgPath)) {
    throw new Error('[eol-doncorleone] config.json was not present in bundles/eol-doncorleone, aborting!');
}
var bdConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
var bd = null;

module.exports = function(nodecg) {
    squirrel('barry-donations', function barryDonationsLoaded(err, BarryDonations) {
        bdConfig.hostname = nodecg.config.host;
        bd = new BarryDonations(bdConfig);
        bd.on('initialized', initialized);
        bd.on('newdonations', gotDonations);
    });

    nodecg.declareSyncedVar('totals', {});

    function initialized(data) {
        log.info('[eol-doncorleone] Listening for donations to', bd.options.username);
        nodecg.variables.totals = data.totals;
    }

    function gotDonations(data) {
        nodecg.variables.totals = data.totals;
    }

    nodecg.listenFor('resetCategory', function resetCategory(data) {
        bd.resetCategory(data);
    });
};