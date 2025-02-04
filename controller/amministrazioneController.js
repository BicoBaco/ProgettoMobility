const amministrazioneModel = require('../models/amministrazioneModel');
const prenotazioneModel = require('../models/prenotazioneModel');
var express = require('express');
var session = require('express-session');
const { resolveInclude } = require('ejs');
var createError = require('http-errors');
const nodemailer = require("nodemailer");

const passwordAmministratore = "123";

module.exports = {
    accedi: function(req, res, next) {
        if (req.body.password == passwordAmministratore) {
            req.session.autistaloggedin = false;
            req.session.loggedin = false;
            req.session.adminloggedin = true;
            console.log("Admin Logged");
            res.redirect('amministrazione');
        }   
    },

    getPaginaAmministrazione: async function(req, res, next) {
        if(req.session.adminloggedin == true) {
            res.render('amministrazione/pannelloDiControllo', {title: 'Amministrazione', errorMsg: null});
        }else{
            res.redirect('accessoAmministrazione');
        }
    },

    getPaginaGestioneAutisti: async function(req, res, next) {
        if(req.session.adminloggedin == true) {
            let results = {}; 
            results = await amministrazioneModel.getAutisti()
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            }); 
           res.render('amministrazione/gestioneAutisti', {title: 'Gestione Autisti', errorMsg: null, autisti: results});
        } else {
            res.redirect('../accessoAmministrazione');
        }
    },

    aggiungiAutista: async function(req, res, next) {
        if(req.session.adminloggedin == true) {
            let password=Math.random().toString(36).slice(-8);

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: 'progetto.mobility.unipa@gmail.com',
                pass: 'progettounipa2021'
                },

            });
            
            var mailOptions = {
                from: 'progettomobility',
                to: req.body.email,
                subject: 'Assegnazione password Progetto Mobility',
                text: 'La password generata è: ' + password
            };
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            autistaData = {    
                email: req.body.email,
                nome: req.body.nome,
                cognome: req.body.cognome,
                telefono: req.body.telefono,
                password: password
            }

            await amministrazioneModel.registrazioneAutista(autistaData).catch(err => {  
                console.log(err);
                next(createError(500));
            });

            res.redirect('/amministrazione/gestioneautisti');
        } else {
            res.redirect('../accessoAmministrazione');
    }
    },

    rimuoviAutista: async function(req, res, next) {
        if(req.session.adminloggedin == true) {
            await amministrazioneModel.rimozioneAutista(req.body.autista).catch(err => {  
                console.log(err);
                next(createError(500));
            });

            res.redirect('/amministrazione/gestioneautisti');
        } else {
            res.redirect('../accessoAmministrazione');
        }
    },

    getPaginaGestionePrenotazioni: async function(req, res, next) {
        if(req.session.adminloggedin == true) {
            let prenotazioni = {}; 
            prenotazioni = await prenotazioneModel.getPrenotazioniComplete()
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            }); 

            let parcheggi = {};
            parcheggi = await prenotazioneModel.getParcheggi()
            .catch(err => { 
                console.log(err);
                next(createError(err.statusCode, err));  
            }); 
 
            res.render('amministrazione/gestionePrenotazioni', {title: 'Gestione Prenotazioni', errorMsg: null, prenotazioni: prenotazioni, parcheggi: parcheggi});
        }else{
            res.redirect('../accessoAmministrazione');
        }
    },
    
    modificaStato: async function(req, res, next) {
        await prenotazioneModel.modificaStato(req.body.idPrenotazione, req.body.stato)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            }); 
        res.redirect('/amministrazione/gestioneprenotazioni');  
    },    

    modificaParcheggio: async function(req, res, next) {
        if(req.body.parcheggioPartenza) {
            await prenotazioneModel.modificaParcheggioPartenza(req.body.idPrenotazione, req.body.parcheggioPartenza)
                .catch(err => { 
                        console.log(err);
                        next(createError(err.statusCode, err));  
                });
        } else if(req.body.parcheggioArrivo) {
            await prenotazioneModel.modificaParcheggioArrivo(req.body.idPrenotazione, req.body.parcheggioArrivo)
                .catch(err => { 
                        console.log(err);
                        next(createError(err.statusCode, err));  
                });
        }
        res.redirect('/amministrazione/gestioneprenotazioni');  
    },

    modificaPartenza: async function(req, res, next) {
        await prenotazioneModel.modificaPartenza(req.body.idPrenotazione, req.body.dataPartenza, req.body.orarioPartenza)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            }); 
        res.redirect('/amministrazione/gestioneprenotazioni');  
    },

    modificaArrivo: async function(req, res, next) {
        await prenotazioneModel.modificaArrivo(req.body.idPrenotazione, req.body.dataArrivo, req.body.orarioArrivo)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            }); 
        res.redirect('/amministrazione/gestioneprenotazioni');  
    },

    getPaginaGestioneVeicoli: async function(req, res, next) {
        if(req.session.adminloggedin == true) {
            let veicoli = {}; 
            veicoli = await prenotazioneModel.getVeicoli()
            .catch(err => { 
                console.log(err);
                next(createError(err.statusCode, err));  
            }); 

            let parcheggi = {};
            parcheggi = await prenotazioneModel.getParcheggi()
            .catch(err => { 
                console.log(err);
                next(createError(err.statusCode, err));  
            }); 

            res.render('amministrazione/gestioneVeicoli', {veicoli: veicoli, parcheggi: parcheggi});
        }else{
            res.redirect('../accessoAmministrazione');
        }
    },

    aggiungiVeicolo: async function(req, res, next) {
        if(req.session.adminloggedin == true) {
            var veicoloData = {
                tipo: req.body.tipoVeicolo,
                targa: req.body.targa,
                idParcheggio: req.body.parcheggio
            }
            await amministrazioneModel.aggiungiVeicolo(veicoloData)
                .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
                }); 

            res.redirect('../gestioneVeicoli');
        } else {
            res.redirect('../accessoAmministrazione');
        }
    },

    rimuoviVeicolo: async function(req, res, next) {
        if(req.session.adminloggedin == true) {
            var veicoloData = {
                tipo: req.body.tipoVeicolo,
                idParcheggio: req.body.parcheggio
            }
            await amministrazioneModel.aggiungiVeicolo(veicoloData)
                .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
                }); 

            res.redirect('../gestioneVeicoli');
        } else {
            res.redirect('../accessoAmministrazione');
        }
    },

    spostaVeicolo: async function(req, res, next) {
        if(req.session.adminloggedin == true) {
            await amministrazioneModel.spostaVeicolo(req.body.idVeicolo, req.body.idParcheggio)
                .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
                }); 

            res.redirect('../gestioneVeicoli');
        } else {
            res.redirect('../accessoAmministrazione');
        }
    },

    rimuoviVeicolo: async function(req, res, next) {
        if(req.session.adminloggedin == true) {
            await amministrazioneModel.rimuoviVeicolo(req.body.idVeicolo)
                .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
                }); 

            res.redirect('../gestioneVeicoli');
        } else {
            res.redirect('../accessoAmministrazione');
        }
    },

    guastoRiparato: async function(req, res, next) {
        if(req.session.adminloggedin == true)   {
            await prenotazioneModel.riparaGuasto(req.body.idPrenotazione) 
                .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
                });

            res.redirect("../gestioneprenotazioni");  
        } else {
            res.redirect('../accessoAmministrazione');
        }
    },
}
