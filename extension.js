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
    if (!bdConfig.hostname) {
        bdConfig.hostname = nodecg.config.host;
    }

    var self = this;
    events.EventEmitter.call(this);

    bd = new BarryDonations(nodecg.bundleConfig);

    bd.on('connectfail', function connectfail(e) {
        nodecg.log.error('Connectfail:', e.message);
    });

    bd.on('error', function error(e) {
        nodecg.log.error('Error:', e.stack);
    });

    bd.on('disconnected', function disconnected(e) {
        nodecg.log.error('Disconnected:', e.stack);
    });

    bd.on('reconnecting', function reconnecting(interval) {
        nodecg.log.info('reconnecting in %d seconds', interval);
    });

    bd.on('initialized', function initialized(data) {
        nodecg.log.info('Listening for donations to', bd.options.username);
        convertNamelessTopDonorsToAnonymous(data.totals);
        totals.value = data.totals;
        nodecg.sendMessage('initialized', data);
        self.emit('initialized', data);
    });

    bd.on('newdonations', function gotDonations(data) {
        convertNamelessTopDonorsToAnonymous(data.totals);
        totals.value = data.totals;

        // If the name is blank, change it to "Anonymous"
        data.Completed.forEach(function(donation) {
            if (donation.twitch_username === '') {
                donation.twitch_username = 'Anonymous';
            }
        });

        nodecg.sendMessage('tip', data);
        self.emit('tip', data);
    });

    var totals = nodecg.Replicant('totals', { defaultValue: {}, persistent: false });
    nodecg.listenFor('resetCategory', function resetCategory(category) {
        bd.resetCategory(category)
            .then(function(cat) {
                nodecg.log.info('Successfully reset:', cat);
            })
            .fail(function(e) {
                nodecg.log.error('Failed to reset %s:', category, e.message) ;
            });
    });

    function convertNamelessTopDonorsToAnonymous(totals) {
        if (totals) {
            if (totals.day_top_packet
                && totals.day_top_packet.twitch_username === '') {
                totals.day_top_packet.twitch_username = 'Anonymous';
            }

            if (totals.month_top_packet
                && totals.month_top_packet.twitch_username === '') {
                totals.month_top_packet.twitch_username = 'Anonymous';
            }
        }
    }
}

util.inherits(DonCorleone, events.EventEmitter);

module.exports = function(extensionApi) { return new DonCorleone(extensionApi); };
