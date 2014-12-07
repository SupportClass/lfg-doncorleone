#eol-doncorleone
This is a [NodeCG](http://github.com/nodecg/nodecg) bundle.

Listens for donations to a given account on [Barry's Donation Tracker](http://don.barrycarlyon.co.uk) and emits API events for other bundles to use.
Also displays stats on the dashboard and easily allows the user to reset said stats.

## Installation
- Install to `nodecg/bundles/eol-doncorleone`
- Create `nodecg/cfg/eol-doncorleone.json` with the username and password of the [Barry's Donation Tracker](http://don.barrycarlyon.co.uk) account
that you wish to listen to:
```
#!json
{
    "username": "myUsername",
    "password": "myPassword"
}
```

## Usage
### As a dashboard panel
If you simply want to see top donations for the `day` and `month` periods on your dashboard, you are done.

### In other bundles' view pages and dashboard panels
If you would like to use this data in another bundle, add the following code to your view/panel:
```
#!javascript
nodecg.listenFor('donation', 'eol-doncorleone', callback);
```
... where 'callback' is the name of a function with the signature `function callback(data)`

### In other bundles' extensions
If you want to use donation events in another bundle's extension,
add `eol-doncorleone` as a `bundleDependency` in your bundle's [`nodecg.json`](https://github.com/nodecg/nodecg/wiki/nodecg.json)

Then add the following code:
```
#!javascript
var donCorleone = nodecg.extensions['eol-doncorleone'];

donCorleone.on('initialized', function initialized(data) {
    // do work
    // data.Completed = Array of recently completed donations
    // data.totals = Object containing stats such as data.totals.day_top and data.totals.month_top
    // Other properties exist as well
));

donCorleone.on('gotDonations', function gotDonations(data) {
   // do work
   // data object is the same as in the 'initialized' event
   // However, in this event 'data.Completed' is only newly completed donations.

   // Example of iterating over the data.Completed property and processing each new donation
   data.Completed.forEach(function(donation) {
       console.log(donation);
   });
));
```

