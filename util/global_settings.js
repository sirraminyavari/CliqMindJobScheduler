const getSettings = (dic, prefix) => {
    prefix = prefix ? prefix + "_" : "";

    let retDic = {};

    for (let key in dic) {
        if (!dic[key] || ((dic[key] || "_").constructor == "gesi".constructor)){
            retDic[key] = dic[key] === false ? dic[key] : process.env[(prefix + key).toUpperCase()] || dic[key];
        }
        else if (dic[key].constructor == {}.constructor){
            retDic[key] = getSettings(dic[key], prefix + key);
        }
    }

    return retDic;
};


exports.settings = getSettings({
    MongoDBURL: "mongodb://localhost:27017/cliqmind_scheduler",
    Redis: { 
        Host: "redis",
        Port: "6379",
        Password: ""
    },
    WebApp: {
        BaseURL: "",
        Username: "",
        Password: ""
    }
});