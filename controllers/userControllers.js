//module xac nhan user

const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var con = require('./connectDB'); // module database

let checkUser = function (req, res, next) {
  if (!req.session.passport.user || !req.isAuthenticated() || req.session.passport.user[2] != 0) return res.render('baoloidangnhap');
  next();
}

module.exports = (app) => {
  //trang dieu huong user
  app.get('/user', checkUser, function (req, res) {
    let userID = req.session.passport.user[3];
    res.render('trangchuUser', { userID });
  });
  //đăng bài theo chủ đề
  app.get('/addNew', checkUser, function (req, res) {
    let userID = req.session.passport.user[3];
    res.render('addNew', { userID });
  });
  app.post('/addNew', urlencodedParser, checkUser, function (req, res) {
    let userID = req.session.passport.user[3];
    var type = req.body.type;
    var name = req.body.name;
    var name1 = req.body.name1;
    var time = req.body.time;
    var author = req.body.author;
    var content1 = req.body.content1;
    var content2 = req.body.content2;
    var content3 = req.body.content3;
    var content4 = req.body.content4;
    var content5 = req.body.content5;
    var image1 = req.body.image1;
    var image2 = req.body.image2;
    var image3 = req.body.image3;

    var sql = "insert into " + type + "(name,time,author,content1,content2,content3,content4,content5,image1,image2,postManId,name1,image3) values(N'" + name + "','" + time + "','" + author + "','" +
      content1 + "','" + content2 + "','" + content3 + "','" + content4 + "','" + content5 + "','" + image1 + "','" +
      image2 + "','" + userID + "','" + name1 + "','" + image3 + "')";
    //console.log(sql);
    con.query(sql, function (error) {
      if (error) {
        res.send("loi trong thuc thi câu lệnh");
      } else {
        res.redirect('/xemtindadang/' + userID);
      }
    });
  });
  //xem tin da dang
  app.get('/xemtindadang/:id', checkUser, function (req, res) {
    let userID = req.session.passport.user[3];
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
    con.query(sql, function (error, results, fields) {
      if (error) {
        console.log(sql);
        res.send("loi trong thuc thi câu lệnh");
      } else {
        res.render('hienxemtin1', { results, userID });
      }
    });
  });
  //xóa tin
  app.get('/user/delete/:type/:id', checkUser, function (req, res) {
    let userID = req.session.passport.user[3];
    var sql = "delete from " + req.params.type + " where id=" + req.params.id;
    con.query(sql, function (error) {
      if (error) {
        res.send('loi thực thi câu lệnh');
      } else {
        res.redirect('/xemtindadang/' + userID);
      }
    });
  });
  //chi tiết tin
  app.get('/user/chitiet/:type/:id', checkUser, function (req, res) {
    let userID = req.session.passport.user[3];
    var type = req.params.type
    var id = req.params.id
    var sql = "select * from " + type + " where id=" + id;
    con.query(sql, function (error, results, fields) {
      if (error) {
        res.send('loi thực thi câu lệnh');
      } else {
        res.render('MotTrangTin1', { results });
      }
    });
  });
  //sửa tin
  app.get('/user/suatin/:type/:id', checkUser, function (req, res) {
    let userID = req.session.passport.user[3];
    var sql = "select * from " + req.params.type + " where id=" + req.params.id;
    con.query(sql, function (error, results, fields) {
      if (error) {
        res.send('loi thực thi câu lệnh');
      } else {
        res.render('suaMotTrangTin1', { results });
      }
    });
  });
  app.post('/user/suatin/:type/:id', urlencodedParser, checkUser, function (req, res) {
    let userID = req.session.passport.user[3];
    var type = req.body.type;
    var hot = req.body.hot;
    var name = req.body.name;
    var name1 = req.body.name1;
    var time = req.body.time;
    var author = req.body.author;
    var content1 = req.body.content1;
    var content2 = req.body.content2;
    var content3 = req.body.content3;
    var content4 = req.body.content4;
    var content5 = req.body.content5;
    var image1 = req.body.image1;
    var image2 = req.body.image2;
    var image3 = req.body.image3;

    var sql = "update " + type + " set name='" + name + "',name1='" + name1 + "',time='" + time + "',author='" + author + "',content1='" +
      content1 + "',content2='" + content2 + "',content3='" + content3 + "',content4='" +
      content4 + "',content5='" + content5 + "',image1='" + image1 + "',image2='" + image2 + "',image3='" + image3 + "',hot='" + hot +
      "' where id=" + req.params.id;
    console.log(sql);
    con.query(sql, function (error) {
      if (error) {
        res.send("loi thuc thi cau lenh");

      } else {
        res.redirect('/xemtindadang/' + userID);
      }
    });
  });
  //xua tin
  //=========================================================================================================================
  //báo lỗi
  //dang xuat
  app.get('/dangxuat', function (req, res) {
    req.logout();
    res.redirect('/');
  });
  //================================================================================
  //thêm sửa tác giả
  app.get('/suataikhoan/:id', urlencodedParser, checkUser,function (req, res) {
    console.log(req.params.id);
    let userID = req.session.passport.user[3];
    console.log(userID);
    if ( userID == req.params.id) {
      var sql = "select * from taikhoan where id=" + req.params.id;
      console.log(sql);
      con.query(sql, function (error, results, fields) {
        if (error) {
          res.send('loi thực thi câu lệnh');
        } else {
          res.render('suataikhoan', { results,userID });
        }
      });
    } else res.send('error');
  })
  app.post('/suataikhoan/:id', urlencodedParser, checkUser,function (req, res) {
    let userID = req.session.passport.user[3];
    if (userID == req.params.id) {
      var name = req.body.name;
      var password = req.body.password;
      var email = req.body.email;
      var phone = req.body.phone;
      var address = req.body.address;

      var sql = "update taikhoan set name='" + name + "',password='" + password +
        "',email='" + email +
        "',phone='" + phone +
        "',address='" + address +
        "' where id=" + req.params.id;
      console.log(sql);
      con.query(sql, function (error) {
        if (error) {
          res.send("loi thuc thi cau lenh");

        } else {
          res.redirect('/user');
        }
      });
    } else res.render('error');
  });
};