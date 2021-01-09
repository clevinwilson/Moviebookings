var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var db=require('./config/connection')
var session = require('express-session')

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/user');
var OwnerRouter = require('./routes/owner')
var fileUpload=require('express-fileupload')
var MongoDBStore = require('connect-mongodb-session')(session);
const passport=require('passport')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts/',partialsDir:__dirname+'/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload())
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ resave: false, useUnifiedTopology: true, saveUninitialized: true,secret:"Key",cookie:{maxAge:60000000},store:new MongoDBStore({mongoConnection:db.connection,databaseName:"moviebooking"}),}))
db.connect((err)=>{
  
  if(err) console.log("Connection Error"+err);
  else console.log("Database connected to port 27017");
})

app.use(passport.initialize());
app.use(passport.session());

app.use('/admin', adminRouter);
app.use('/', usersRouter);
app.use('/owner',OwnerRouter);

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

module.exports = app;
