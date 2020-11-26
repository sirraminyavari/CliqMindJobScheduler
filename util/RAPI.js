const axios = require('axios');

const RAPI = {
    _BaseURL: "",
    _Username: "",
    _Password: "",

    Ticket: null,

    init: function (params) {
        RAPI._BaseURL = (params || {}).BaseURL || RAPI._BaseURL;
        RAPI._Username = (params || {}).Username || RAPI._Username;
        RAPI._Password = (params || {}).Password || RAPI._Password;

        RAPI.Ticket = null;
    },

    EndPoints: {
        API: "api/"
    },

    get_type: (function () {
        var f = (function () { }).constructor, j = ({}).constructor, a = ([]).constructor,
            s = ("gesi").constructor, n = (2).constructor, b = (true).constructor, t = (new Date()).constructor;

        return function (value) {
            if (value === null) return "null";
            else if (value === undefined) return "undefined";

            switch (value.constructor) {
                case f: return "function";
                case j: return "json";
                case a: return "array";
                case s: return "string";
                case n: return "number";
                case b: return "boolean";
                case t: return "datetime";
                default: return String(typeof (value));
            }
        }
    })(),

    _parse: function (input) {
        console.log(input);
        try { return RAPI.get_type(input) == "json" ? input : JSON.parse(String(input || "{}")); }
        catch (e) { return { error: "json parse error" }; }
    },

    _ajax_request: function (data, callback, params) {
        var url = RAPI._BaseURL;
        if (url) {
            if (url[url.length - 1] != '/') url += '/';
            url += params.Action;
        }

        if (RAPI.get_type(callback) != "function") return;
        
        params = params || {};
        data = data || {};

        data.time_stamp = (new Date()).getTime();
        data.Ticket = RAPI.Ticket ? RAPI.Ticket : null;

        let isGet = params.Method && (String(params.Method).toLowerCase() == "get");
        console.log({ url: url, data: data });
        axios[isGet ? "get" : "post"](url, data)
            .then(d => callback(RAPI._parse((d || {}).data)))
            .catch(error => console.error(error));
    },

    authenticate: function (callback) {
        if ((RAPI.Ticket === false) || RAPI.Ticket) return callback(RAPI.Ticket, true);

        var authenticate = RAPI._ajax_request({ username: RAPI._Username, password: RAPI._Password }, function (d) {
            callback(RAPI.Ticket = (d || {}).Ticket ? d.Ticket : false);
        }, { Action: RAPI.EndPoints.API + "authenticate" });
    },

    send_request: function (data, callback, params) {
        if (RAPI.get_type(callback) != "function") return;

        RAPI.authenticate(function (d, oldTicketUsed) {
            if (d === false) return callback({ error: "authentication failed" });

            RAPI._ajax_request(data, !oldTicketUsed ? callback : function (r) {
                if ((r || {}).InvalidTicket === true) {
                    RAPI.Ticket = null;
                    RAPI.send_request(data, callback, params);
                }
                else callback(r);
            }, params);
        });
    },

    post: function (action, data, callback) {
        RAPI.send_request(data, callback, { Method: "POST", Action: action });
    },

    get: function (action, data, callback) {
        RAPI.send_request(data, callback, { Method: "GET", Action: action });
    },

    get_all_applications: function (data, callback) {
        RAPI.post(RAPI.EndPoints.API + "get_all_applications", data, callback);
    },

    run_job: function (data, callback) {
        RAPI.post(RAPI.EndPoints.API + "run_job", data, callback);
    }
};

exports.RAPI = RAPI;