var express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  passport = require('passport');

module.exports = function (app, config) {

  app.set('views', config.rootPath + '/server/views');
  app.set('view engine', 'jade');

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({extended: false}));

  // cookieParser
  app.use(cookieParser());
  // parse application/json
  app.use(bodyParser.json());
  //passport session
  app.use(session({secret: 'multi', resave: false, saveUninitialized: false}));
  app.use(passport.initialize());
  app.use(passport.session());
  // use morgan
  app.use(morgan('dev'));

  app.use(express.static(config.rootPath + '/public'));

  // Add headers
  app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
  });
};