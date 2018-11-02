var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function (app) {

  app.get('/', function (req, res) {
    res.render('index');
  });

  // login
  app.post('/login', function (req, res, next) {
    var auth = passport.authenticate('local', function (err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.send({success: false})
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        res.send({success: true, user: user});
      })
    });
    auth(req, res, next);
  });

  // statystyki graczy
  app.get('/stats', function (req, res) {
    User.find({}).sort({points: -1}).exec(function (err, users) {
      if (err) throw err;
      res.json(users);
    });
  });

  // pojedynczy kupon
  app.post('/coupon/:id', function (req, res) {
    var id = req.body.username;
    var fix_id = parseInt(req.params.id);
    console.log(id + ' ' + fix_id);
    User.findOne({username: id}).exec(function (err, user) {
      if (err) throw err;
      if (user) {
        for (var i = 0, l = user.coupons.length; i < l; i++) {
          if (user.coupons[i].fix_id === fix_id) {
            console.log('wchodzi tu' + i);
            res.json(user.coupons[i]);
            break;
          }
        }
      }
    });
  });

  //aktualizacja punktow uzytkownika
  app.put('/coupon/:username', function (req, res) {
    var username = req.params.username;
    var points = parseFloat(req.body.points);
    User.findOne({username: username}).exec(function (err, user) {
      if (err) throw err;
      if (user) {
        user.points += points;
        user.save(function (err) {
          if (err) throw err;
          User.findOne({username: username}).exec(function (err, user1) {
            res.send({success: true, user: user1});
          });
        });
      }
    });
  });

  // wysylanie kuponu

  app.post('/send', function (req, res) {
    console.log(req.body);
    var user = req.body.username;
    var coupon = req.body.coupon;
    User.findOne({username: user}).exec(function (err, user) {
      if (err) throw err;
      if (user) {
        for (var i = 0, l = user.coupons.length; i < l; i++) {
          if (user.coupons[i].fix_id === coupon.fix_id) {
            res.status(404).send('Kupon na ta kolejke juz wyslany');
            break;
          }
        }
        user.coupons.push(coupon);
        user.save(function (err) {
          if (err) throw err;
          res.send({success: true, user: user});
          console.log('Wyslano odpowiedz');
        });
      }
    });
  });

};