const fileModel = require('../models/fileModel');
var express = require('express');
var session = require('express-session');
var createError = require('http-errors');

module.exports = {
    getPaginaGestioneDocumenti: async function(req, res, next) {
        if(req.session.loggedin) { 
            let results = {}; 

            results = await fileModel.getDocumenti(req.session.idCliente)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });  
            res.render('cliente/gestioneDocumenti', { title: 'Gestione Documenti', errorMsg: null, documenti: results });
        } else {
            res.redirect('login');
        }
    },
    
    aggiungiDocumento: async function(req, res, next) {
        if(req.session.loggedin) {
            if(!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('Nessun file caricato');
            }

            documento = {
                idCliente: req.session.idCliente,
                tipologia: req.body.tipologia,
                estensione: req.files.foto.name.split('.').pop()    
            }

            let idDocumento = await fileModel.aggiungiDocumento(documento);

            req.files.foto.mv("./uploads/"+idDocumento+'.'+documento.estensione, function(err) {
                    if(err)
                        return res.status(500).send(err);
                });
            
            res.redirect('../gestionedocumenti');

        } else {
            res.redirect('login');
        }
    },

    rimuoviDocumento: async function(req, res, next) {
        if(req.session.loggedin) {
            fileData = {
                idCliente: req.session.idCliente,
                idDocumento: req.body.idDocumento,
            }

            await fileModel.rimuoviDocumento(fileData)
            .catch(err => { 
                    console.log(err);
                    next(createError(err.statusCode, err));  
            });
            res.redirect('../gestionedocumenti');
        } else {
            res.redirect('login');
        }
    },
    
    downloadDocumento: function(req, res, next) {
        const file = `${__dirname}/../`+req.body.path;

        console.log(req.body.path);
        res.download(file);
    }
}
