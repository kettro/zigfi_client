var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var indexController = require('./routes/index-controller');
var dashboardController = require('./routes/dashboard-controller');
var accountsController = require('./routes/accounts-controller');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// sessions
app.use(session({
  secret: 'sessionSecret',
  resave: false,
  saveUninitialized: true
}));
// serve less
app.use(require('less-middleware')(path.join(__dirname, 'public')));
// serve things in 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexController);
app.use('/dashboard', dashboardController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.error(err.stack);
  res.render('error');
});

module.exports = app;
