const userModel = require('../models/userModel');
const prenotazioneModel = require('../models/prenotazioneModel');
var express = require('express');
var session = require('express-session');
const { resolveInclude } = require('ejs');
var createError = require('http-errors');

module.exports = {
    registra: async function(req, res, next) {
        userData = {    //dati inseriti dall'utente
            email: req.body.email,
            password: req.body.password,
            nome: req.body.nome,
            cognome: req.body.cognome,
            telefono: req.body.telefono,
            nomecompleto: req.body.nome + " " + req.body.cognome
        }

        let idCliente = null;   
        idCliente = await userModel.registrazione(userData).catch(err => {  
            console.log(err);
            next(createError(500));
        });

        req.session.adminloggedin = false;
        req.session.autistaloggedin = false;
        req.session.loggedin = true;
        req.session.email = userData.email;
        req.session.idCliente = idCliente;

        res.render('cliente/signed', { title: 'Registrazione effettuata' });
    },

    accedi: async function(req, res, next) {
        userData = {
            password: req.body.password,
            email: req.body.email
        }

        let idCliente = null;
        let error = false;  // variabile per non fare eseguire la seconda parte di codice ed evitare due reindirizzamenti
        idCliente = await userModel.autenticazione(userData)
        .catch(err => { 
            res.render('cliente/login', {title: 'Login', errorMsg: err});
            error = true;
            }
        );  

        if(!error) {
            req.session.adminloggedin = false;
            req.session.autistaloggedin = false;
            req.session.loggedin = true;
            req.session.email = userData.email;
            req.session.idCliente = idCliente;
            res.redirect('../');
        }
    },

    getProfilo: async function(req, res, next) {
        if(req.session.loggedin == true)   {
            let results = {}; 

            results = await userModel.getUtente(req.session.idCliente)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });  

            res.render('cliente/profilo', {title: 'Profilo di ' + results.nome, userData: results[0]});  
        }
        else {
            res.redirect('login');
        }
    },

    modificaNome: async function(req, res, next) {
        let results = {}; 
        if(req.session.loggedin) {
            results = await userModel.modificaNome(req.session.idCliente, req.body.nome)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });
        res.redirect('../profilo');  

        } else {
            res.redirect('/login');
        }
    },

    modificaCognome: async function(req, res, next) {
        let results = {}; 
        if(req.session.loggedin) {
            results = await userModel.modificaCognome(req.session.idCliente, req.body.cognome)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            }); 
        res.redirect('../profilo');  

        } else {
            res.redirect('/login');
        }
    },

    modificaEmail: async function(req, res, next) {
        if(req.session.loggedin) {
            await userModel.modificaEmail(req.session.idCliente, req.body.email)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });
        res.redirect('../profilo');  

        } else {
            res.redirect('/login');
        }
    },

    modificaTelefono: async function(req, res, next) {
        if(req.session.loggedin) {
            await userModel.modificaTelefono(req.session.idCliente, req.body.telefono)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            }); 
        res.redirect('../profilo');  

        } else {
            res.redirect('/login');
        }
    },


    getPaginaPrenotazioniCliente: async function(req, res, next) { 
        if(req.session.loggedin == true) {
            let prenotazioniCliente = {};
            prenotazioniCliente = await prenotazioneModel.getPrenotazioniCliente(req.session.idCliente);
            
            let parcheggi = {};
            parcheggi = await prenotazioneModel.getParcheggi();

            let veicoli = {};
            veicoli = await prenotazioneModel.getVeicoli();

            res.render('cliente/prenotazioniCliente', {prenotazioni: prenotazioniCliente, parcheggi: parcheggi, veicoli: veicoli}); 
        } else {
            res.redirect('/login');
        }
    },
    
}