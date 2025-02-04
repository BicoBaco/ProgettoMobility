const prenotazioneModel = require('../models/prenotazioneModel');
const metodoPagamentoModel = require('../models/metodoPagamentoModel');
const fileModel = require('../models/fileModel')
const nodemailer = require("nodemailer");
var createError = require('http-errors');
const PDFDocument = require('pdfkit');
const fs = require('fs');

module.exports = {
    getPaginaPrenotazione: async function(req, res, next) {

        if(req.session.loggedin == true) {
            let parcheggi = {}; 

            parcheggi = await prenotazioneModel.getParcheggi()
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });  
			
			prenotazioni = await prenotazioneModel.getPrenotazioni()
			.catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });
				
			veicoli = await prenotazioneModel.getVeicoli()
			.catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });

            documenti = await fileModel.getDocumenti(req.session.idCliente)
			.catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });

			
            res.render('cliente/map', {parcheggi: parcheggi, prenotazioni: prenotazioni, veicoli: veicoli, documenti: documenti});
        } else {
            res.redirect('login');
        }
    },

    getPaginaEffettuarePagamento: async function(req, res, next) {
        if(req.session.loggedin == true) {
            results = await metodoPagamentoModel.getMetodiPagamento(req.session.idCliente)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });
            
            req.body._csrf = "";

            console.log("risultato dal post della prenotazione:");
            console.log(req.body);
            
            res.render('cliente/effettuarePagamento', {informazioniPrenotazione: req.body, metodiDiPagamento: results}); 
        }
        else {
            res.redirect('/login');
        } 
    },
    
    prenotaVeicolo: async function(req, res, next) {
        if(req.session.loggedin == true) {
            prenotazione = {
                idCliente: req.session.idCliente,
                tipoVeicolo: req.body.tipoVeicolo,
                idParcheggioPartenza: req.body.parcheggioPartenza,
                dataPartenza: req.body.dataPartenza,
                orarioPartenza: req.body.orarioPartenza,
                idParcheggioArrivo: req.body.parcheggioArrivo,
                dataArrivo: req.body.dataArrivo,
                orarioArrivo: req.body.orarioArrivo,
                metodoPagamento: req.body.metodoPagamento,
                numeroCarta: req.body.numeroCarta,
                autista: req.body.autista
            }

            await prenotazioneModel.inserisciPrenotazione(prenotazione)
            .catch(err => { 
                console.log(err);
                next(createError(err.statusCode, err));  
            });
            
            var tariffa;
            if(prenotazione.tipoVeicolo == "automobile") {
                tariffa = 10;
            } else if (prenotazione.tipoVeicolo == "moto") {
                tariffa = 8;
            } else if (prenotazione.tipoVeicolo == "bicicletta") {
                tariffa = 3;
            } else if (prenotazione.tipoVeicolo == "monopattino") {
                tariffa = 2.5;
            }
            
            dataoraPartenza = StringToDateObject(prenotazione.dataPartenza, prenotazione.orarioPartenza);
            dataoraArrivo = StringToDateObject(prenotazione.dataArrivo, prenotazione.orarioArrivo);

            var hours = Math.abs(dataoraArrivo - dataoraPartenza) / 36e5;
            var costoTotale = hours * tariffa;
            costoTotale=Math.round((costoTotale+ Number.EPSILON) * 100) / 100;

            console.log("costo totale: " + costoTotale);
            res.render('cliente/pagamentoEffettuato', {costoTotale: costoTotale, numeroCarta: prenotazione.numeroCarta});
        } else {
            res.redirect('../login');
        }
    },

    downloadRicevuta: function(req, res, next) {
        const doc = new PDFDocument();
        doc.pipe(res);
        doc
            .fontSize(25)
            .text('Pagamento effettuato a ProgettoMobility ')
            .text('Pagato con ' + req.body.numeroCarta)
            .text('Totale: ' + req.body.costoTotale + '€');
        doc.end();
    },

    sbloccaVeicolo: async function(req, res, next) {
        if(req.session.loggedin == true)   {
            let prenotazione = {};
            prenotazione = await prenotazioneModel.getPrenotazioneCliente(req.session.idCliente, req.body.idPrenotazione)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });
            
            let date = new Date();

            if(prenotazione[0].idCliente == req.session.idCliente && prenotazione[0].stato == 'effettuata' && prenotazione[0].orarioPartenza <= date) { 
                await prenotazioneModel.iniziaPrenotazione(req.body.idPrenotazione, req.body.idVeicolo)
                .catch(err => { 
                        console.log(err);
                        next(createError(err.statusCode, err));  
                });

                await prenotazioneModel.rimuoviVeicoloDaParcheggio(req.body.idVeicolo)
                .catch(err => { 
                        console.log(err);
                        next(createError(err.statusCode, err));  
                });

                let veicolo = await prenotazioneModel.getVeicolo(req.body.idVeicolo)
                .catch(err => { 
                        console.log(err);
                        next(createError(err.statusCode, err));  
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
                    to: req.session.email,
                    subject: 'Codice sblocco ' + prenotazione[0].tipoVeicolo,
                    text: 'Il codice per sbloccare il veicolo ' + prenotazione[0].tipoVeicolo+' è il seguente: '+ veicolo[0].codiceSblocco
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }

            res.redirect('back');
        } else {
            res.redirect('/login');
        }    
    }, 

    segnalaGuasto: async function(req, res, next) {
        if(req.session.loggedin == true)   {
            results = await prenotazioneModel.segnalaGuasto(req.body.idPrenotazione) 
            .catch(err => { 
                console.log(err);
                next(createError(err.statusCode, err));  
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
                to: 'vincenzo.messina15@community.unipa.it',
                subject: 'Segnalazione Guasto Veicolo',
                text: 'E\' stato segnalato un guasto dall\'email ' + req.session.email + ' del veicolo ' + req.body.idVeicolo
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });

            res.redirect('back');
        
        } else {
            res.redirect('/login');
        }
    },

    terminaPrenotazione: async function(req, res, next) {
        if(req.session.loggedin == true)   {
                 
            let stato=req.body.stato;
            let idPrenotazione=req.body.idPrenotazione;
            let tipoVeicolo=req.body.tipoVeicolo;
            let dataConsegna=req.body.orarioArrivo;
            let now=new Date();

            if(!(stato=='ritardo' || stato=='in corso')){
                res.redirect('back');
            }
            
            await prenotazioneModel.terminaPrenotazione(idPrenotazione)
            .catch(err => { 
                console.log(err);
                next(createError(err.statusCode, err));  
            });
            
            prenotazioneCompletata = await prenotazioneModel.getPrenotazioneCompletaCliente(req.session.idCliente, req.body.idPrenotazione) 
            .catch(err => { 
                console.log(err);
                next(createError(err.statusCode, err));  
            });

            await prenotazioneModel.mettiVeicoloInParcheggio(prenotazioneCompletata[0].idVeicolo, prenotazioneCompletata[0].idParcheggioArrivo)
            .catch(err => { 
                console.log(err);
                next(createError(err.statusCode, err));  
            });

            if(stato=='ritardo'){
                var tariffa;
                if(tipoVeicolo == "automobile") {
                    tariffa = 10;
                } else if (tipoVeicolo == "moto") {
                    tariffa = 8;
                } else if (tipoVeicolo == "bicicletta") {
                    tariffa = 3;
                } else if (tipoVeicolo == "monopattino") {
                    tariffa = 2.5;
                }

                tariffa *= 3;

                let ritardo = Math.abs(new Date(dataConsegna) - now) / 36e5;
                var costoTotale = ritardo * tariffa;

                let ore = Math.trunc(ritardo);
                let minuti = Math.trunc((ritardo - ore)*60);

                costoTotale=Math.round((costoTotale+ Number.EPSILON) * 100) / 100;

                console.log("Sono stati addebitati " + costoTotale + " euro per la consegna in ritardo di " + ore + " ore e " + minuti + " minuti relativa alla prenotazione " + idPrenotazione);
                
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'progetto.mobility.unipa@gmail.com',
                      pass: 'progettounipa2021'
                    },
        
                  });
                  
                  var mailOptions = {
                    from: 'progettomobility',
                    to: req.session.email,
                    subject: 'Pagamento conguaglio',
                    text: 'La avvisiamo che le sono stati addebitati '+ costoTotale+ ' euro per la consegna in ritardo di ' + ore + ' ore e ' + minuti + ' minuti del veicolo relativo alla sua prenotazione '+idPrenotazione
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                });
            }
            
            res.redirect('back');

        } else {
            res.redirect('/login');
        }
    },

    annullaPrenotazione: async function(req, res, next) {
        if(req.session.loggedin == true)   {

            let stato = req.body.stato;
            let idPrenotazione = req.body.idPrenotazione;
            let tipoVeicolo = req.body.tipoVeicolo;
            let dataPartenza = req.body.dataPartenza;
            let now = new Date();
            var min = ((new Date(dataPartenza) - now) / 36e5) * 60;

            console.log(min);
            console.log(stato);
            if(stato == 'effettuata' && min > 10){
                
                results = await prenotazioneModel.getPrenotazioneCliente(req.session.idCliente, req.body.idPrenotazione)
                .catch(err => { 
                        console.log(err);
                        next(createError(err.statusCode, err));  
                });

                if(results.length != 0){
                    await prenotazioneModel.cancellaPrenotazione(req.body.idPrenotazione)
                    .catch(err => { 
                        console.log(err);
                        next(createError(err.statusCode, err));  
                    });
                }

                res.redirect('back');
            } else {
                res.redirect('back');
            }
        } else {
            res.redirect('/login');
        }
    },

    getPaginaNotificaRitardo: async function(req, res, next) {
        if(req.session.loggedin == true) {
            result = await prenotazioneModel.getPrenotazioneCompletaCliente(req.session.idCliente, req.query.id)
                .catch(err => { 
                        console.log(err);
                        next(createError(err.statusCode, err));  
                });
            
            if(result.length != 0 && result[0].stato == "ritardo") {
                
                let ritardo = Math.abs((new Date(result[0].orarioArrivo)) - (new Date())) / 36e5;

                let ore = Math.trunc(ritardo);
                let minuti = Math.trunc((ritardo - ore)*60);

                result[0].ore = ore;
                result[0].minuti = minuti;
                res.render('cliente/notificaRitardo', {prenotazione: result[0]}); 
            } else {
                res.redirect('/');
            } 
        } else {
            res.redirect('/login');
        }
    },

    notificaRitardo: async function(req, res, next) {
        if(req.session.loggedin == true) {
            if(req.body.motivoRitardo == "guasto") {
                await module.exports.segnalaGuasto(req, res, next);
            }

            await prenotazioneModel.notificaRitardo(req.body.motivoRitardo, req.body.stimaConsegna, req.body.idPrenotazione)
                .catch(err => { 
                        console.log(err);
                        next(createError(err.statusCode, err));  
                });

            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    },
}

function StringToDateObject(data, orario) {
    res = orario.split(":");
    ora = res[0];
    minuti = res[1];
    
    dataora = new Date(data);
    dataora.setHours(ora, minuti);

    //GMT+2
    //dataora.setHours(dataora.getHours() - 2);
    
    return dataora;
}