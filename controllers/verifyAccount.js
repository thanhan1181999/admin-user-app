// module xac nhan tai khoan

const session = require('express-session');
const Passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

var connect = require('./connectDB'); // module database
var actor = require('./actor');

module.exports = (app) => {

    app.use(session({
        secret: "mysecret",
        cookie: {maxAge:60000*20}//20 minutes
    }));
    app.use(Passport.initialize());
    app.use(Passport.session());
    //-------------------------
    app.route('/')
        .get((req, res) => res.render('dangnhap'))
        .post(Passport.authenticate('local', { failureRedirect: '/', successRedirect: '/loginOK' }));
    app.get('/loginOK', (req, res) => {
        //console.log('req.session.passport.user[2] : '+ req.session.passport.user[2]);
        if (req.session.passport.user[2] == 1) return res.redirect('/admin');
        else return res.redirect('/user');
    });
    //--------------------------
    Passport.use(new LocalStrategy(
        (username, password, done) => {
            var sql = "select count(*) as num from taikhoan where user='" + username + "' and password='" + password + "' " +
                " union select is_admin from taikhoan where user='" + username + "' and password='" + password + "' " +
                " union select id from taikhoan where user='" + username + "' and password='" + password + "' ";

            connect.query(sql, function(error, results, fields) {
                //console.log(results);
                if (error) return done(null, false);
                //no account 
                if(results.length==1) return done(null, false);
                //have account
                let isAdmin=1;
                let id=0;
                //is user
                if(results.length==3 && results[1].num=='N'){
                    isAdmin=0;
                    id=results[2].num;
                }
                let user=[username, password,isAdmin,id];
                return done(null,user);
            });
        }
    ))


    Passport.serializeUser((user, done) => { done(null, user) })
    Passport.deserializeUser((user, done) => {
        var sql = "select count(*) as num,is_admin as isAdmin from taikhoan where user='" + user[0] + "' and password='" + user[1] + "' group by is_admin";
        connect.query(sql, function(error, results, fields) {
            if (error) return done(null, false);
            else {
                if (results[0].num > 0) {
                    return done(null, user);
                } else return done(null, false)
            }
        });
    });
};