var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
var csrf = require('csurf');                         //protezione da richieste post esterne tramite un token
const nodemailer = require("nodemailer");

var { makeDb, withTransaction } = require('./config/dbmiddleware');
var { config } = require('./config/config');

var router = require('./routes/router');

var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

// setting del token per la protezione
app.use(csrf());
app.use(function (req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.locals.csrftoken = req.csrfToken();
  next();
});

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  
  if(req.session.loggedin == undefined) {
    req.session.loggedin = false;
  }
  if(req.session.adminloggedin == undefined) {
    req.session.adminloggedin = false;
  }
  if(req.session.autistaloggedin == undefined) {
    req.session.autistaloggedin = false;
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Codice per il controllo periodico dei ritardi, con invio email, ogni 5 minuti
setInterval(async function(){    
  var db = await makeDb(config);
  await withTransaction(db, async() => {
    results = await db.query('SELECT idPrenotazione, orarioArrivo FROM Prenotazione WHERE stato = \'in corso\'')
        .catch(err => {
            throw err;
        });         
  }); 

  for(let i = 0; i < results.length; i++) {
    var dataArrivo = new Date(results[i].orarioArrivo);
    var now = new Date();
    now.setMinutes(now.getMinutes()+5);

    if(dataArrivo < now) {
      console.log(results[i].idPrenotazione + " in ritardo");
      var db = await makeDb(config);
      await withTransaction(db, async() => {
        await db.query('UPDATE Prenotazione SET stato = \'ritardo\' WHERE idPrenotazione = ?', [results[i].idPrenotazione])
            .catch(err => {
                throw err;
            }); 
        email = await db.query('SELECT email FROM Prenotazione pr INNER JOIN CredenzialiCliente cc ON pr.idCliente = cc.idCliente WHERE pr.idPrenotazione = ?', [results[i].idPrenotazione])
        .catch(err => {
            throw err;
        }); 

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'progetto.mobility.unipa@gmail.com',
            pass: 'progettounipa2021'
          },

        });
        
        var mailOptions = {
          from: 'progettomobility',
          to: email[0].email,
          subject: 'Avviso di ritardo consegna',
          html: 'La prenotazione è in ritardo di consegna, è necessario compilare il seguente form: <a href="https://progetto-mobility.herokuapp.com/notificaritardo?id=' + results[i].idPrenotazione + '"> Clicca qui </a>'
        };
        
        transporter.sendMail(mailOptions, function(error, info) {
          if(error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });        
      }); 
    }
  }

  // Codice per il controllo periodico di prenotazioni terminate senza sblocco
  db = await makeDb(config);
  await withTransaction(db, async() => {  
    results = await db.query('SELECT idPrenotazione, orarioArrivo FROM Prenotazione WHERE stato = \'effettuata\'')
        .catch(err => {
            throw err;
        });         
  }); 

  for(let i = 0; i < results.length; i++) {
    var dataArrivo= new Date(results[i].orarioArrivo);
    var now=new Date();

    if(dataArrivo < now) {
      console.log(results[i].idPrenotazione + " terminata per mancato sblocco");
      var db = await makeDb(config);
      await withTransaction(db, async() => {
        await db.query('UPDATE Prenotazione SET stato = \'terminata\' WHERE idPrenotazione = ?', [results[i].idPrenotazione])
            .catch(err => {
                throw err;
            });           
      }); 
    }
  }
}, 1000 * 60 * 5);

module.exports = app;

