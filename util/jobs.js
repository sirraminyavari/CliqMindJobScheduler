const globalSettings = require('./global_settings').settings;
const Agenda = require('agenda');

var agenda = new Agenda({
    name: "CliqMind Jobs",
    defaultConcurrency: 10,
    maxConcurrency: 20,
    db: {
        address: globalSettings.DBURL, 
        collection: "scheduled_jobs", 
        options: { server: { auto_reconnect: true } }
    }
});



agenda.define("job1", { priority: 'high', concurrency: 10 }, function (job, done) {
    done();
    
    console.log('job1 done');
});


exports.initialize = function (){
    agenda.on('ready', () => {
        agenda.every('1 minutes', ['job1']);

        agenda.start();
    });
};