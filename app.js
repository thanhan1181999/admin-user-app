const express = require('express');
const bodyParser = require('body-parser');
const app = express(); //tạo app
var serverPort = process.env.PORT || 3000;
var verifyAccount = require('./controllers/verifyAccount.js');
var adminControllers = require('./controllers/adminControllers.js');
var userControllers = require('./controllers/userControllers.js');
var con = require('./controllers/connectDB.js'); // module database

con.connect();


//cai dat duong dan nguon, cach hien
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })
    //ham co the lay du lieu tu form giao dien
app.use(bodyParser.urlencoded({ extended: true }));


//xac thuc tai khoan
verifyAccount(app);

// admincontrollers
adminControllers(app);

//các nhiệm vụ của user
userControllers(app);

// app nghe o cong severPort
app.listen(serverPort, () => {
    console.log("Server is listening on PORT : " + serverPort);
});