const globalSettings = require('./global_settings').settings;
const Agenda = require('agenda');
const RAPI = require('./RAPI').RAPI;

RAPI.init({ 
    BaseURL: globalSettings.WebApp.BaseURL,
    Username: globalSettings.WebApp.Username, 
    Password: globalSettings.WebApp.Password 
});

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

const runJobs = (appId, jobs, callback) => {
    if(!jobs || !jobs.length) return callback();

    var job = jobs.pop();

    RAPI.run_job({  ApplicationID: appId, Options: JSON.stringify(job) }, () => {
        runJobs(appId, jobs, callback);
    });
};

const processAppIds = (appIds, callback) => {
    if(!appIds || !appIds.length) return callback();

    let id = appIds.pop();

    var jobs = [
        { name: "index_update", type: "Node", batch_size: 100 },
        { name: "index_update", type: "NodeType", batch_size: 100 },
        { name: "index_update", type: "User", batch_size: 100 },
        { name: "index_update", type: "File", batch_size: 100 },
        { name: "extract_file_contents", count: 2 },
        { name: "remove_temporary_files"  },
        { name: "send_emails", batch_size: 10 }
    ];

    jobs.reverse();

    runJobs(id, jobs, () => { processAppIds(appIds, callback); });
};

const getApplications = (count, callback, lowerBoundary, appIds) => {
    lowerBoundary = lowerBoundary || 1;
    appIds = appIds || {};

    RAPI.get_all_applications({ Count: count, LowerBoundary: lowerBoundary }, (data) => {
        ((data || {}).Applications || []).forEach(app => appIds[app.ApplicationID] = true);

        if((data || {}).TotalCount && (lowerBoundary < data.TotalCount))
            getApplications(count, callback, lowerBoundary + (data.Applications || []).length, appIds);
        else { 
            var arr = [];
            for(var key in appIds) arr.push(key);

            callback(arr);
        }
    });
};

agenda.define("cliqmind_update_job", { priority: 'high', concurrency: 10 }, function (job, done) {
    getApplications(100, (appIds) => {
        console.log(appIds);
        processAppIds(appIds, () => { done(); });
    });
});


exports.initialize = function (){
    agenda.on('ready', () => {
        agenda.every('1 hours', ['cliqmind_update_job']);

        agenda.start();
    });
};