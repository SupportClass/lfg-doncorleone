'use strict';

var log = require('../../lib/logger');
var squirrel = require('squirrel');
var fs = require('fs');
var events = require('events');
var util = require('util');

var cfgPath = __dirname + '/config.json';
if (!fs.existsSync(cfgPath)) {
    throw new Error('[eol-doncorleone] config.json was not present in bundles/eol-doncorleone, aborting!');
}
var bdConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
var bd = null;

function DonCorleone(nodecg) {
    if (DonCorleone.prototype._singletonInstance) {
        return DonCorleone.prototype._singletonInstance;
    }
    DonCorleone.prototype._singletonInstance = this;

    var self = this;

    squirrel('barry-donations', function barryDonationsLoaded(err, BarryDonations) {
        bdConfig.hostname = nodecg.config.host;
        bd = new BarryDonations(bdConfig);

        bd.on('initialized', function initialized(data) {
            log.info('[eol-doncorleone] Listening for donations to', bd.options.username);
            nodecg.variables.totals = data.totals;
            nodecg.sendMessage('initialized', data);
            self.emit('initialized', data);
        });
        bd.on('newdonations', function gotDonations(data) {
            nodecg.variables.totals = data.totals;
            nodecg.sendMessage('gotDonations', data);
            self.emit('gotDonations', data);
        });
    });

    events.EventEmitter.call(this);

    nodecg.declareSyncedVar({ variableName: 'totals' });
    nodecg.listenFor('resetCategory', function resetCategory(data) {
        bd.resetCategory(data);
    });
}

util.inherits(DonCorleone, events.EventEmitter);

module.exports = function(extensionApi) { return new DonCorleone(extensionApi); };