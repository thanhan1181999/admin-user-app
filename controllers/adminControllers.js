// module cua admin


const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var con = require('./connectDB'); // module database

let checkAdmin= function(req,res,next){
    if(!req.session.passport.user || !req.isAuthenticated() || req.session.passport.user[2]==0) return res.render('baoloidangnhap');
    next();
}

module.exports = (app) => {

    app.get('/admin', checkAdmin, function(req, res) {      
           return res.render('trangchuAdmin');
    });

    //thêm tài khoản
    app.get('/themtaikhoan', checkAdmin, function(req, res) {
           return res.render('themtaikhoan');
    });

    app.post('/themtaikhoan', urlencodedParser, checkAdmin, function(req, res) {
            var name = req.body.name;
            var email = req.body.email;
            var phone = req.body.phone;
            var user = req.body.user;
            var password = req.body.password;
            var confirmPass = req.body.confirmPass;

            var sql = "insert into taikhoan(name,email,phone,user,password) values(N'" +
                name + "','" + email + "','" + phone + "','" + user + "','" + password + "')";
            console.log(sql);
            con.query(sql, function(error) {
                if (error) {
                    return res.send("loi trong thuc thi câu lệnh");
                } else return res.redirect('/xemtaikhoan');
            });
    });

    // xem tai khoan
    app.get('/xemtaikhoan', checkAdmin,function(req, res) {
            var sql = "select * from taikhoan where is_admin='N'";
            con.query(sql, function(error, results, fields) {
                if (error) {
                    return res.send("loi trong thuc thi câu lệnh");
                } else {
                    return res.render('xemtaikhoan', { results });
                }
            });
    });

    app.get('/xoataikhoan/:id', urlencodedParser, checkAdmin,function(req, res) {
            var id = req.params.id;
            var sql = "delete from taikhoan where id= " + id;
            con.query(sql, function(error) {
                if (error) {
                    return res.send("loi trong thuc thi câu lệnh");
                } else {
                    return res.redirect('/xemtaikhoan');
                }
            });
    });


    //xem tin và xóa tin
    app.get('/xemtin', checkAdmin,function(req, res) {
            var sql = "select t.name as name,t.time as time,t.type as type,t.type1 as type1,t.id as id,tg.name as author from bongda t INNER JOIN taikhoan tg on t.postManId =tg.id";
            con.query(sql, function(error, results, fields) {
                if (error) {
                    return res.send("loi trong thuc thi câu lệnh");
                } else {
                    return res.render('xemtin', { results });
                }
            });
    });
    app.get('/hienxemtin/:type', checkAdmin, function(req, res) {
            var type = req.body.type;
            var sql = "select t.name as name,t.time as time,t.type as type,t.type1 as type1,t.id as id,tg.name as author from " +
                req.params.type + " t INNER JOIN taikhoan tg on t.postManId =tg.id";

            con.query(sql, function(error, results, fields) {
                if (error) {
                    return res.send("loi trong thuc thi câu lệnh");
                } else {
                    return res.render('hienxemtin', { results });
                }
            });
    })


    //xóa tin
    app.get('/delete/:type/:id', checkAdmin, function(req, res) {
            var sql = "delete from " + req.params.type + " where id=" + req.params.id;
            con.query(sql, function(error) {
                if (error) {
                    return res.send('loi thực thi câu lệnh');
                } else {
                    return res.redirect('/hienxemtin/' + req.params.type);
                }
            });
    });


    //chi tiết tin
    app.get('/chitiet/:type/:id', checkAdmin, function(req, res) {
            var sql = "select * from " + req.params.type + " where id=" + req.params.id;
            con.query(sql, function(error, results, fields) {
                if (error) {
                    return res.send('loi thực thi câu lệnh');
                } else {
                    return res.render('MotTrangTin', { results });
                }
            });
    });
    app.post('/chitiet/:type/:id', urlencodedParser, checkAdmin,function(req, res) {
            var hot = req.body.hot;
            var sql = "update " + req.params.type + " set hot='" + hot + "' where id=" + req.params.id;
            con.query(sql, function(error, results, fields) {
                if (error) {
                    return res.send('loi thực thi câu lệnh');
                } else {
                    return res.redirect('/hienxemtin/' + req.params.type);
                }
            });
    });

    //sửa tin
    app.get('/suatin/:type/:id', checkAdmin,function(req, res) {
            var sql = "select * from " + req.params.type + " where id=" + req.params.id;
            con.query(sql, function(error, results, fields) {
                if (error) {
                    return res.send('loi thực thi câu lệnh');
                } else {
                    return res.render('suaMotTrangTin', { results });
                }
            });
    });
    app.post('/suatin/:type/:id', urlencodedParser, checkAdmin,function(req, res) {
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
                    return res.send("loi thuc thi cau lenh");
                } else {
                    return res.redirect('/hienxemtin/' + type);
                }
            });
    });
    //xem va xoa gop y
    app.get('/xemgopy', checkAdmin,function(req, res) {
            var sql = "select * from gopy";
            con.query(sql, function(error, results, fields) {
                if (error) {
                    return res.send('loi thực thi câu lệnh');
                } else {
                    return res.render('xemgopy', { results });
                }
            });
    });
    app.get('/xoagopy/:id', checkAdmin,function(req, res) {
            var id = req.params.id;
            var sql = "delete from gopy where id=" + id;
            con.query(sql, function(error, results, fields) {
                if (error) {
                    return res.send('loi thực thi câu lệnh');
                } else {
                    return res.redirect('/xemgopy');
                }
            });
    });

};