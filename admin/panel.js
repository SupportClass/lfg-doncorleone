$(function () {
    var modal = $('#eol-doncorleone_modal');
    var panel = $('#eol-doncorleone');
    var dayAmount = panel.find('.js-day').find('.js-amount');
    var dayUsername = panel.find('.js-day').find('.js-username');
    var monthAmount = panel.find('.js-month').find('.js-amount');
    var monthUsername = panel.find('.js-month').find('.js-username');

    nodecg.declareSyncedVar('totals', {}, function (totals) {
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

        dayAmount.html(dayamt.formatMoney());
        dayAmount.attr('title', dayamt.formatMoney());
        dayUsername.html(dayusr);
        dayUsername.attr('title', dayusr);

        monthAmount.html(monthamt.formatMoney());
        monthAmount.attr('title', monthamt.formatMoney());
        monthUsername.html(monthusr);
        monthUsername.attr('title', monthusr);
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

    Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator, currencySymbol) {
        // check the args and supply defaults:
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces;
        decSeparator = decSeparator == undefined ? "." : decSeparator;
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator;
        currencySymbol = currencySymbol == undefined ? "$" : currencySymbol;

        var n = this,
            sign = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;

        var formatted = sign + currencySymbol + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");

        var parts = formatted.split('.');
        var dollars = parts[0];
        var cents = parts[1];

        return parseInt(cents) === 0
            ? dollars
            : formatted;
    };
});
