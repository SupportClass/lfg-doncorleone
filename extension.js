'use strict';

var log = require('../../lib/logger/index');
var squirrel = require('squirrel');
var fs = require('fs');
var events = require('events');
var util = require('util');

var bd = null;

function DonCorleone(nodecg) {
    if (DonCorleone.prototype._singletonInstance) {
        return DonCorleone.prototype._singletonInstance;
    }
    DonCorleone.prototype._singletonInstance = this;

    if (!nodecg.bundleConfig) {
        throw new Error('[eol-doncorleone] No config found in cfg/eol-doncorleone.json, aborting!');
    }

    var bdConfig = nodecg.bundleConfig;
    var self = this;

    squirrel('barry-donations', function barryDonationsLoaded(err, BarryDonations) {
        bdConfig.hostname = nodecg.config.host;
        bd = new BarryDonations(nodecg.bundleConfig);

        bd.on('connectfail', function connectfail(e) {
            log.error('[eol-doncorleone]', e.message)
        });

        bd.on('error', function error(e) {
            log.error('[eol-doncorleone]', e.message)
        });

        bd.on('disconnected', function disconnected(e) {
            log.error('[eol-doncorleone]', e.message)
        });

        bd.on('reconnecting', function reconnecting(interval) {
           log.info('[eol-doncorleone] reconnecting in %d seconds', interval)
        });

        bd.on('initialized', function initialized(data) {
            log.info('[eol-doncorleone] Listening for donations to', bd.options.username);
            nodecg.variables.totals = data.totals;
            nodecg.sendMessage('initialized', data);
            self.emit('initialized', data);
        });

        bd.on('newdonations', function gotDonations(data) {
            nodecg.variables.totals = data.totals;
            nodecg.sendMessage('gotDonations', data);

            // If the name is blank, change it to "undefined"
            data.Completed.forEach(function(donation) {
                if (donation.twitch_username == '')
                    donation.twitch_username = 'Anonymous';
            });

            self.emit('gotDonations', data);
        });
    });

    events.EventEmitter.call(this);

    nodecg.declareSyncedVar({ variableName: 'totals' });
    nodecg.listenFor('resetCategory', function resetCategory(data) {
        bd.resetCategory(data)
            .then(function(category) {
                log.info('[eol-doncorleone] Successfully reset:', category);
            })
            .fail(function(e) {
                log.error('[eol-doncorleone]', e.message) ;
            });
    });
}

util.inherits(DonCorleone, events.EventEmitter);

module.exports = function(extensionApi) { return new DonCorleone(extensionApi); };