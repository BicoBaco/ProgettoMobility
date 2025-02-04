var express = require('express');
var session = require('express-session');
const { resolveInclude } = require('ejs');

module.exports = {
    index: function(req, res, next) {
        console.log(req.session);

        if(req.session.adminloggedin) {
            res.redirect('amministrazione');
        } else if(req.session.loggedin) {
            res.redirect('prenotazione');
        } else if(req.session.autistaloggedin) {
            res.redirect('autista/prenotazioni');
        } else {
            res.redirect('login');
        }


    },

    registrazione: function(req, res, next) {
        if(!req.session.loggedin)
            res.render('cliente/signup');
        else
            res.redirect('back');
    },

    accesso: function(req, res, next) {
        if(req.session.loggedin || req.session.autistaloggedin || req.session.adminloggedin) {
            res.redirect("/");
        }
        else if(!req.session.loggedin)
            res.render('cliente/login', { title: 'Login ', errorMsg: null });
        else
            res.redirect('back');
    },

    logout: function(req, res, next) {
        if(req.session.loggedin || req.session.adminloggedin || req.session.autistaloggedin)
            req.session.destroy();

        res.redirect('/');
    },

    accessoAmministrazione: function(req, res, next) {
        if(req.session.adminloggedin == true) {
            res.redirect('/amministrazione'); 
        }
        else {
            res.render('amministrazione/accessoAmministrazione', { title: 'Accesso Amministrazione ', errorMsg: null });
        }
    }
}