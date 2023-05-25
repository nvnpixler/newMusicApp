var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');

const constants = require('./config/constants');
const baseMiddleware = require('./middlewares/baseMiddleware');

var adminRouter = require('./routes/admin');
var singerRouter = require('./routes/singer');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
const fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');

var app = express();
var server = require('http').createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));

// app.use(express.json())
app.use(bodyParser.json({ limit: '100mb' }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules_url', express.static(path.join(__dirname, 'node_modules')));

app.use(session({
  secret: 'djhxc34231241252asdf23slsakdf3adsflkas2',
	resave: true,
	saveUninitialized: true
}));

app.use(baseMiddleware);

app.use('/', adminRouter);
app.use('/singer', singerRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// console.log(process.env.NODE_ENV, "root file")

server.listen(global.appPort, (err, resu) => {
  if (err) throw err;
  console.log(`server listening on port: ${global.appPort}`);
});

module.exports = app;
