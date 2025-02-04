const autistaModel = require('../models/autistaModel');
const prenotazioneModel = require('../models/prenotazioneModel');
var express = require('express');
var session = require('express-session');

module.exports = {
    getPaginaAccessoAutista: async function(req, res, next) {
            if(!req.session.autistaloggedin)
                res.render('autista/accessoAutista', {title: 'Login Autisti', errorMsg: null});
            else
                res.redirect('autista/prenotazioni');
    },
    accedi: async function(req, res, next) {
        autistaData = {
            password: req.body.password,
            email: req.body.email
        }

        let idAutista = null;
        let error = false;  // variabile per non fare eseguire la seconda parte di codice ed evitare due reindirizzamenti
        idAutista = await autistaModel.autenticazione(autistaData)
        .catch(err => { 
            res.render('autista/accessoAutista', {title: 'Login', errorMsg: err});
            error = true;
            }
        );  

        if(!error) {
            req.session.adminloggedin = false;
            req.session.loggedin = false;
            req.session.autistaloggedin = true;
            req.session.email = autistaData.email;
            req.session.idAutista = idAutista;
            res.redirect('../');
        }
    },

    getPaginaPrenotazioniAutista: async function(req, res, next) { 
        if(req.session.autistaloggedin == true) {
            let prenotazioniAutista = {};
            prenotazioniAutista = await prenotazioneModel.getPrenotazioniAutista(req.session.idAutista);
            
            let parcheggi = {};
            parcheggi = await prenotazioneModel.getParcheggi();

            let veicoli = {};
            veicoli = await prenotazioneModel.getVeicoli();

            res.render('autista/prenotazioniAutista', {prenotazioni: prenotazioniAutista, parcheggi: parcheggi, veicoli: veicoli}); 
        }
        else {
            res.redirect('/accessoAutista');
        }
    },

    accettaPrenotazione: async function(req, res, next) { 
        if(req.session.autistaloggedin == true) {
            if(req.body.stato == "in attesa autista") {
                await prenotazioneModel.accettaPrenotazione(req.body.idPrenotazione, req.session.idAutista);
            }

            res.redirect('back'); 
        }
        else {
            res.redirect('/accessoAutista');
        }
    },

    rifiutaPrenotazione: async function(req, res, next) { 
        if(req.session.autistaloggedin == true) {
            if(req.body.stato == "in attesa autista") {
                await prenotazioneModel.rifiutaPrenotazione(req.body.idPrenotazione, req.session.idAutista);
            }

            res.redirect('back'); 
        }
        else {
            res.redirect('/accessoAutista');
        }
    },
}