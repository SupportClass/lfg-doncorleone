/* jshint camelcase: false */
'use strict';

var BarryDonations = require('barry-donations');
var events = require('events');
var util = require('util');

var bd = null;

function DonCorleone(nodecg) {
    if (!Object.keys(nodecg.bundleConfig).length) {
        throw new Error('[lfg-doncorleone] No config found in cfg/lfg-doncorleone.json, aborting!');
    }

    var bdConfig = nodecg.bundleConfig;
    var self = this;
    events.EventEmitter.call(this);

    bdConfig.hostname = nodecg.config.host;
    bd = new BarryDonations(nodecg.bundleConfig);

    bd.on('connectfail', function connectfail(e) {
        nodecg.log.error(e.message);
    });

    bd.on('error', function error(e) {
        nodecg.log.error(e.message);
    });

    bd.on('disconnected', function disconnected(e) {
        nodecg.log.error(e.message);
    });

    bd.on('reconnecting', function reconnecting(interval) {
        nodecg.log.info('reconnecting in %d seconds', interval);
    });

    bd.on('reconnectfail', function reconnectfail(e) {
        nodecg.log.error(e.message);
    });

    bd.on('initialized', function initialized(data) {
        nodecg.log.info('Listening for donations to', bd.options.username);
        nodecg.variables.totals = data.totals;
        nodecg.sendMessage('initialized', data);
        self.emit('initialized', data);
    });

    bd.on('newdonations', function gotDonations(data) {
        nodecg.variables.totals = data.totals;
        nodecg.sendMessage('gotDonations', data);

        // If the name is blank, change it to "Anonymous"
        data.Completed.forEach(function(donation) {
            if (donation.twitch_username === '')
                donation.twitch_username = 'Anonymous';
        });

        self.emit('gotDonations', data);
    });

    nodecg.declareSyncedVar({ variableName: 'totals' });
    nodecg.listenFor('resetCategory', function resetCategory(data) {
        bd.resetCategory(data)
            .then(function(category) {
                nodecg.log.info('Successfully reset:', category);
            })
            .fail(function(e) {
                nodecg.log.error(e.message) ;
            });
    });
}

util.inherits(DonCorleone, events.EventEmitter);

module.exports = function(extensionApi) { return new DonCorleone(extensionApi); };