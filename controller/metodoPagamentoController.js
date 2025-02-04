const metodoPagamentoModel = require('../models/metodoPagamentoModel');
var express = require('express');
var session = require('express-session');
const { resolveInclude } = require('ejs');
var createError = require('http-errors');

module.exports = {
    getPaginaMetodiPagamento: async function(req, res, next) {
        if(req.session.loggedin == true) {
            let results = {}; 

            results = await metodoPagamentoModel.getMetodiPagamento(req.session.idCliente)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });  
            
            console.log(results);
            res.render('cliente/gestioneMetodiPagamento', {title: 'Metodi di Pagamento', userData: results});
        } else {
            res.redirect('login');
        }
    },

    aggiungiMetodoPagamento: async function(req, res, next) {
        if(req.session.loggedin == true) {
            userData = {
                idCliente: req.session.idCliente,
                numeroCarta: req.body.numeroCarta,
                dataScadenza: req.body.dataScadenza,
                cvv: req.body.cvv
            }

            await metodoPagamentoModel.aggiungiMetodoPagamento(userData)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });

            res.redirect('/gestionemetodipagamento');
        } else {
            res.redirect('login');
        }  
    },

    rimuoviMetodoPagamento: async function(req, res, next) {
        if(req.session.loggedin == true) {
            userData = {
                idCliente: req.session.idCliente,
                idMetodoPagamento: req.body.idMetodoPagamento,
            }

            await metodoPagamentoModel.rimuoviMetodoPagamento(userData)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });  

            res.redirect('/gestionemetodipagamento');
        } else {
            res.redirect('login');
        }
    }
}