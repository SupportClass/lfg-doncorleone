/* jshint camelcase: false */
'use strict';

var modal = $('#lfg-doncorleone_modal');
var panel = $bundle.filter('.donation-stats');
var dayAmount = panel.find('.js-day').find('.js-amount');
var dayUsername = panel.find('.js-day').find('.js-username');
var monthAmount = panel.find('.js-month').find('.js-amount');
var monthUsername = panel.find('.js-month').find('.js-username');

nodecg.declareSyncedVar({ variableName: 'totals',
    setter: function(totals){
        if (!totals)
            return;

        var dayamt = 0;
        var dayusr = 'N/A';
        var monthamt = 0;
        var monthusr = 'N/A';

        if (totals.day_top_packet.amount > 0) {
            dayamt = totals.day_top_packet.amount;
            dayusr = totals.day_top_packet.twitch_username;
        }

        if (totals.month_top_packet.amount > 0) {
            monthamt = totals.month_top_packet.amount;
            monthusr = totals.month_top_packet.twitch_username;
        }

        dayAmount.html(formatMoney(dayamt));
        dayAmount.attr('title', formatMoney(dayamt));
        dayUsername.html(dayusr);
        dayUsername.attr('title', dayusr);

        monthAmount.html(formatMoney(monthamt));
        monthAmount.attr('title', formatMoney(monthamt));
        monthUsername.html(monthusr);
        monthUsername.attr('title', monthusr);
    }
});

//triggered when modal is about to be shown
modal.on('show.bs.modal', function(e) {
    //get data-id attribute of the clicked element
    var period = $(e.relatedTarget).data('period');
    $(this).find('.js-period')
        .html(period)
        .data('period', period);
});

modal.find('.js-reset').click(function() {
    var period = modal.find('.js-period').data('period');
    period += '_top';
    nodecg.sendMessage('resetCategory', period);
});

function formatMoney(n) {
    if (!n) return '$0';
    // hilarious regex stolen from http://stackoverflow.com/a/14428340/3903335
    return '$' + n.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}
