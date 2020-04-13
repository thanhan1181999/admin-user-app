//khoi tao csdl

var mysql = require('mysql');
var connect = mysql.createConnection({
    host: "db4free.net",
    user: "thanhan1181999",
    password: "77621176211",
    database: "news_data",
    port: "3306"
});

module.exports= connect;