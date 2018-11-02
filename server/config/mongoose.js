var mongoose = require('mongoose');

module.exports = function (config) {
  mongoose.connect(config.db);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error..'));
  db.once('open', function callback() {
    console.log('baza danych guessScore otworzona');
  });

  var userSchema = mongoose.Schema({
    username: String,
    password: String,
    points: Number,
    coupons: [{
      fix_id: Number,
      matches: [String],
      done: Boolean
    }]
  });

  var User = mongoose.model('User', userSchema);

  User.find({}).exec(function (err, collection) {
    if (collection.length === 0) {
      User.create({username: 'admin', password: 'admin', points: 0});
      User.create({username: 'anon1m', password: 'qwerty', points: 0});
      User.create({username: 'roman', password: 'qwerty', points: 0});
      User.create({username: 'tomasz', password: 'qwerty', points: 0});
      User.create({username: 'czeslaw', password: 'qwerty', points: -666});
    }
  });

};