const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');
const cookie = require('cookie');
//tạo app
const app = express();
//ket noi csdl
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "db4free.net",
    user: "thanhan1181999",
    password: "77621176211",
    database: "news_data",
    port: "3306"
});
/*
host: "db4free.net",
    user: "thanhan1181999",
    password: "77621176211",
    database: "news_data",
    port: "3306"
	
	 user: "root",
    password: "",
    database: "news",
    port: "3306",
    host: "localhost"
*/
con.connect();
//bien nhan biet quan trị vien
var is_admin = 0;
var is_user = 0;
var userID;
var name, pass;
//cai dat duong dan nguon, cach hien
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));
var urlencodedParser = bodyParser.urlencoded({ extended: false })
    //ham co the lay du lieu tu form giao dien
app.use(bodyParser.urlencoded({ extended: true }));
//xac thuc tai khoan===============================================================================================
app.use(session({
    secret: "mysecret",
}));
app.use(Passport.initialize());
app.use(Passport.session());
//-------------------------
app.route('/')
    .get((req, res) => res.render('dangnhap'))
    .post(Passport.authenticate('local', { failureRedirect: '/', successRedirect: '/loginOK' }))
app.get('/loginOK', (req, res) => {
    if (is_admin == 1) res.redirect('/admin');
    else
    if (is_user == 1) res.redirect('/user')
});
//--------------------------
Passport.use(new LocalStrategy(
    (username, password, done) => {
        var sql = "select count(*) as num from taikhoan where user='" + username + "' and password='" + password + "' " +
            " union select is_admin from taikhoan where user='" + username + "' and password='" + password + "' " +
            " union select id from taikhoan where user='" + username + "' and password='" + password + "' ";
        var user = [username, password];
        con.query(sql, function(error, results, fields) {
            if (error) return done(null, false);
            else {
                if (results[0].num > 0) {
                    if (results[1].num == 'Y') {
                        is_admin = 1;
                    } else {
                        is_user = 1;
                        if (results.length == 2)
                            userID = results[0].num;
                        else userID = results[2].num;
                    }
                    return done(null, user)
                } else {
                    return done(null, false);
                }
            }
        });
    }
))


Passport.serializeUser((user, done) => { done(null, user) })
Passport.deserializeUser((user, done) => {
    var sql = "select count(*) as num,is_admin from taikhoan where user='" + user[0] + "' and password='" + user[1] + "' group by is_admin";
    con.query(sql, function(error, results, fields) {
        if (error) return done(null, false);
        else {
            name = user[0];
            pass = user[1];
            if (results[0].num > 0) {
                return done(null, user);
            } else return done(null, false)
        }
    });
});
//========================================================================================================================
//các nhiệm vụ admin------------------------
//trang dieu huong admin
app.get('/admin', function(req, res) {
    if (req.isAuthenticated() && is_admin == 1) {
        res.render('trangchuAdmin');
    } else res.render('baoloidangnhap');
});
//thêm tài khoản
app.get('/themtaikhoan', function(req, res) {
    if (req.isAuthenticated() && is_admin == 1) {
        res.render('themtaikhoan');
    } else res.render('baoloidangnhap');
});
app.post('/themtaikhoan', urlencodedParser, function(req, res) {
    if (req.isAuthenticated() && is_admin == 1) {
        var name = req.body.name;
        var pass = req.body.pass;
        var sql = "insert into taikhoan(user,password) values(N'" + name + "','" + pass + "')";
        con.query(sql, function(error) {
            if (error) {
                res.send("loi trong thuc thi câu lệnh");
            } else {
                res.redirect('/admin');
            }
        });
    } else res.render('baoloidangnhap');
});
//xóa tài khoản
app.get('/xoataikhoan', function(req, res) {
    if (req.isAuthenticated() && is_admin == 1) {
        var sql = "select user from taikhoan where is_admin='N'";
        con.query(sql, function(error, results, fields) {
            if (error) {
                res.send("loi trong thuc thi câu lệnh");
            } else {
                res.render('xoataikhoan', { results });
            }
        });
    } else res.render('baoloidangnhap');
});
app.post('/xoataikhoan', urlencodedParser, function(req, res) {
    if (req.isAuthenticated() && is_admin == 1) {
        var name = req.body.name;
        var sql = "delete from taikhoan where user= '" + name + "'";
        con.query(sql, function(error) {
            if (error) {
                res.send("loi trong thuc thi câu lệnh");
            } else {
                res.redirect('/admin');
            }
        });
    } else res.render('baoloidangnhap');
});
//xem tin và xóa tin
app.get('/xemtin', function(req, res) {
    if (req.isAuthenticated() && is_admin == 1) {
        res.render('xemtin');
    } else res.render('baoloidangnhap');
});
app.get('/hienxemtin/:type', function(req, res) {
        if (req.isAuthenticated()) {
            var type = req.body.type;
            var sql = "select name,time,author,type,id from " + req.params.type;
            con.query(sql, function(error, results, fields) {
                if (error) {
                    res.send("loi trong thuc thi câu lệnh");
                } else {
                    res.render('hienxemtin', { results });
                }
            });
        } else res.render('baoloidangnhap');
    })
    //xóa tin
app.get('/delete/:type/:id', function(req, res) {
    if (req.isAuthenticated() && is_admin == 1) {
        var sql = "delete from " + req.params.type + " where id=" + req.params.id;
        con.query(sql, function(error) {
            if (error) {
                res.send('loi thực thi câu lệnh');
            } else {
                res.redirect('/hienxemtin/' + req.params.type);
            }
        });
    } else res.render('baoloidangnhap');
});
//chi tiết tin
app.get('/chitiet/:type/:id', function(req, res) {
    if (req.isAuthenticated() && is_admin == 1) {
        var sql = "select * from " + req.params.type + " where id=" + req.params.id;
        con.query(sql, function(error, results, fields) {
            if (error) {
                res.send('loi thực thi câu lệnh');
            } else {
                res.render('MotTrangTin', { results });
            }
        });
    } else res.render('baoloidangnhap');
});
//sửa tin
app.get('/suatin/:type/:id', function(req, res) {
    if (req.isAuthenticated()) {
        var sql = "select * from " + req.params.type + " where id=" + req.params.id;
        con.query(sql, function(error, results, fields) {
            if (error) {
                res.send('loi thực thi câu lệnh');
            } else {
                res.render('suaMotTrangTin', { results });
            }
        });
    } else res.render('baoloidangnhap');
});
app.post('/suatin/:type/:id', urlencodedParser, function(req, res) {
    if (req.isAuthenticated()) {
        var type = req.body.type;
        var hot = req.body.hot;
        var name = req.body.name;
        var time = req.body.time;
        var author = req.body.author;
        var content1 = req.body.content1;
        var content2 = req.body.content2;
        var content3 = req.body.content3;
        var content4 = req.body.content4;
        var content5 = req.body.content5;
        var image1 = req.body.image1;
        var image2 = req.body.image2;
        var sql = "update " + type + " set type='" + type + "',name='" + name + "',time='" + time + "',author='" + author + "',content1='" +
            content1 + "',content2='" + content2 + "',content3='" + content3 + "',content4='" +
            content4 + "',content5='" + content5 + "',image1='" + image1 + "',image2='" + image2 + "',hot='" + hot +
            "' where id=" + req.params.id;
        con.query(sql, function(error) {
            if (error) {
                res.send("loi thuc thi cau lenh");
            } else {
                res.redirect('/hienxemtin/' + type);
            }
        });
    } else res.render('baoloidangnhap');
});
//xem va xoa gop y
app.get('/xemgopy', function(req, res) {
    if (req.isAuthenticated()) {
        var sql = "select * from gopy";
        con.query(sql, function(error, results, fields) {
            if (error) {
                res.send('loi thực thi câu lệnh');
            } else {
                res.render('xemgopy', { results });
            }
        });
    } else res.render('baoloidangnhap');
});
app.get('/xoagopy/:id', function(req, res) {
    if (req.isAuthenticated()) {
        var id = req.params.id;
        var sql = "delete from gopy where id=" + id;
        con.query(sql, function(error, results, fields) {
            if (error) {
                res.send('loi thực thi câu lệnh');
            } else {
                res.redirect('/xemgopy');
            }
        });
    } else res.render('baoloidangnhap');
});
//các nhiệm vụ của user---------------------
//trang dieu huong user
app.get('/user', function(req, res) {
    if (req.isAuthenticated() && is_user == 1) {
        res.render('trangchuUser', { userID });
    } else res.render('baoloidangnhap');
});
//đăng bài theo chủ đề
app.get('/addNew', function(req, res) {
    if (req.isAuthenticated && is_user == 1) {
        res.render('addNew', { is_admin });
    } else res.render('baoloidangnhap');
});
app.post('/addNew', urlencodedParser, function(req, res) {
    if (req.isAuthenticated && is_user == 1) {
        var type = req.body.type;
        var hot = req.body.hot;
        var name = req.body.name;
        var time = req.body.time;
        var author = req.body.author;
        var content1 = req.body.content1;
        var content2 = req.body.content2;
        var content3 = req.body.content3;
        var content4 = req.body.content4;
        var content5 = req.body.content5;
        var image1 = req.body.image1;
        var image2 = req.body.image2;
        if (type != "" && hot != "" && name != "" && time != "" && author != "" && content1 != "" && content2 != "" && content3 != "" && content4 != "" &&
            content5 != "" && image1 != "" && image2 != "") {
            var sql = "insert into " + type + "(type,name,time,author,content1,content2,content3,content4,content5,image1,image2,hot,postManId) values(N'" +
                type + "',N'" + name + "',N'" + time + "',N'" + author + "',N'" +
                content1 + "',N'" + content2 + "',N'" + content3 + "',N'" + content4 + "',N'" + content5 + "',N'" + image1 + "',N'" +
                image2 + "',N'" + hot + "'," + userID + ")";
            con.query(sql, function(error) {
                if (error) {
                    res.send("loi trong thuc thi câu lệnh");
                } else {
                    res.redirect('/user');
                }
            });
        }
    } else res.render('baoloidangnhap');
});
//xem tin da dang
app.get('/xemtindadang/:id', function(req, res) {
    if (req.isAuthenticated() && is_user == 1) {
        var id = req.params.id;
        var sql = "select name,time,author,type,id from bongda where postManId=" + id +
            " union select name,time,author,type,id from kinhdoanh where postManId=" + id +
            " union select name,time,author,type,id from thitruong where postManId=" + id +
            " union select name,time,author,type,id from suckhoe where postManId=" + id +
            " union select name,time,author,type,id from hitech where postManId=" + id +
            " union select name,time,author,type,id from showbiz where postManId=" + id +
            " union select name,time,author,type,id from thegioi where postManId=" + id +
            " union select name,time,author,type,id from thethao where postManId=" + id +
            " union select name,time,author,type,id from phaidep where postManId=" + id +
            " union select name,time,author,type,id from amthuc where postManId=" + id;
        con.query(sql, function(error, results, fields) {
            if (error) {
                res.send("loi trong thuc thi câu lệnh");
            } else {
                res.render('hienxemtin1', { results });
            }
        });
    } else res.render('baoloidangnhap');
});
//xóa tin
app.get('/user/delete/:type/:id', function(req, res) {
    if (req.isAuthenticated() && is_user == 1) {
        var sql = "delete from " + req.params.type + " where id=" + req.params.id;
        con.query(sql, function(error) {
            if (error) {
                res.send('loi thực thi câu lệnh');
            } else {
                res.redirect('/xemtindadang/' + userID);
            }
        });
    } else res.render('baoloidangnhap');
});
//chi tiết tin
app.get('/user/chitiet/:type/:id', function(req, res) {
    if (req.isAuthenticated()) {
        var type = req.params.type
        var id = req.params.id
        var sql = "select * from " + type + " where id=" + id;
        con.query(sql, function(error, results, fields) {
            if (error) {
                res.send('loi thực thi câu lệnh');
            } else {
                res.render('MotTrangTin1', { results });
            }
        });
    } else res.render('baoloidangnhap');
});
//sửa tin
app.get('/user/suatin/:type/:id', function(req, res) {
    if (req.isAuthenticated()) {
        var sql = "select * from " + req.params.type + " where id=" + req.params.id;
        con.query(sql, function(error, results, fields) {
            if (error) {
                res.send('loi thực thi câu lệnh');
            } else {
                res.render('suaMotTrangTin1', { results });
            }
        });
    } else res.render('baoloidangnhap');
});
app.post('/user/suatin/:type/:id', urlencodedParser, function(req, res) {
    if (req.isAuthenticated()) {
        var type = req.body.type;
        var hot = req.body.hot;
        var name = req.body.name;
        var time = req.body.time;
        var author = req.body.author;
        var content1 = req.body.content1;
        var content2 = req.body.content2;
        var content3 = req.body.content3;
        var content4 = req.body.content4;
        var content5 = req.body.content5;
        var image1 = req.body.image1;
        var image2 = req.body.image2;
        var sql = "update " + type + " set type='" + type + "',name='" + name + "',time='" + time + "',author='" + author + "',content1='" +
            content1 + "',content2='" + content2 + "',content3='" + content3 + "',content4='" +
            content4 + "',content5='" + content5 + "',image1='" + image1 + "',image2='" + image2 + "',hot='" + hot +
            "' where id=" + req.params.id;
        console.log(sql);
        con.query(sql, function(error) {
            if (error) {
                res.send("loi thuc thi cau lenh");

            } else {
                res.redirect('/xemtindadang/' + userID);
            }
        });
    } else res.render('baoloidangnhap');
});
//xua tin
//=========================================================================================================================
//báo lỗi
//dang xuat
app.get('/dangxuat', function(req, res) {
    is_admin = 0;
    is_user = 0;
    userID = 0;
    res.redirect('/');
});
app.listen(process.env.PORT || 3000);