const express = require('express');
const router = express.Router();
var createError = require('http-errors');
const indexController = require('../controller/indexController');
const fileController = require('../controller/fileController');
const userController = require('../controller/userController');
const amministrazioneController = require('../controller/amministrazioneController');
const metodoPagamentoController = require('../controller/metodoPagamentoController');
const prenotazioneController = require('../controller/prenotazioneController');
const autistaController = require('../controller/autistaController');

/* GET home page. */
router.get('/', indexController.index);


router.get('/notificaRitardo', prenotazioneController.getPaginaNotificaRitardo);
router.post('/notificaRitardo', prenotazioneController.notificaRitardo);

/* Autenticazione */

//Login routes
router.get('/login', indexController.accesso);
router.post('/login', userController.accedi);
router.get('/logout', indexController.logout);

//Sign up routes
router.get('/signup', indexController.registrazione);
router.post('/signup', userController.registra);


/* Gestione Prenotazioni */

router.get('/prenotazione', prenotazioneController.getPaginaPrenotazione);

router.post('/cliente/pagamento', prenotazioneController.getPaginaEffettuarePagamento)
router.post('/cliente/completaprenotazione', prenotazioneController.prenotaVeicolo);

/* Amministrazione */
router.get('/amministrazione', amministrazioneController.getPaginaAmministrazione);

router.get('/accessoAmministrazione', indexController.accessoAmministrazione);
router.post('/accessoAmministrazione', amministrazioneController.accedi);

router.get('/amministrazione/gestioneautisti', amministrazioneController.getPaginaGestioneAutisti);
router.post('/amministrazione/gestioneautisti/aggiungi', amministrazioneController.aggiungiAutista);
router.post('/amministrazione/gestioneautisti/rimuovi', amministrazioneController.rimuoviAutista);

router.get('/amministrazione/gestioneprenotazioni', amministrazioneController.getPaginaGestionePrenotazioni);
router.post('/amministrazione/gestioneprenotazioni/modificastato', amministrazioneController.modificaStato);
router.post('/amministrazione/gestioneprenotazioni/modificaparcheggio', amministrazioneController.modificaParcheggio);
router.post('/amministrazione/gestioneprenotazioni/modificapartenza', amministrazioneController.modificaPartenza);
router.post('/amministrazione/gestioneprenotazioni/modificaarrivo', amministrazioneController.modificaArrivo);
router.post('/amministrazione/gestioneprenotazioni/guastoriparato', amministrazioneController.guastoRiparato);

router.get('/amministrazione/gestioneveicoli', amministrazioneController.getPaginaGestioneVeicoli);
router.post('/amministrazione/gestioneveicoli/aggiungiveicolo', amministrazioneController.aggiungiVeicolo);
router.post('/amministrazione/gestioneveicoli/spostaveicolo', amministrazioneController.spostaVeicolo);
router.post('/amministrazione/gestioneveicoli/rimuoviveicolo', amministrazioneController.rimuoviVeicolo);

/* Gestione Utente */

// Profilo
router.get('/profilo', userController.getProfilo);
router.post('/profilo/modificanome', userController.modificaNome);
router.post('/profilo/modificacognome', userController.modificaCognome);
router.post('/profilo/modificaemail', userController.modificaEmail);
router.post('/profilo/modificatelefono', userController.modificaTelefono);

// Metodi di pagamento
router.get('/gestionemetodipagamento', metodoPagamentoController.getPaginaMetodiPagamento);
router.post('/gestionemetodipagamento/aggiungi', metodoPagamentoController.aggiungiMetodoPagamento);
router.post('/gestionemetodipagamento/rimuovi', metodoPagamentoController.rimuoviMetodoPagamento);

// Documenti
router.get('/gestionedocumenti', fileController.getPaginaGestioneDocumenti);
router.post('/gestionedocumenti/aggiungidocumento', fileController.aggiungiDocumento);
router.post('/gestionedocumenti/rimuovidocumento', fileController.rimuoviDocumento);
router.post('/gestionedocumenti/downloadDocumento', fileController.downloadDocumento);

router.post('/cliente/downloadricevuta', prenotazioneController.downloadRicevuta);

// Gestione Prenotazioni effettuate
router.get('/cliente/prenotazioni', userController.getPaginaPrenotazioniCliente);
router.post('/cliente/prenotazioni/sblocca', prenotazioneController.sbloccaVeicolo);
router.post('/cliente/prenotazioni/consegna', prenotazioneController.terminaPrenotazione);
router.post('/cliente/prenotazioni/annulla', prenotazioneController.annullaPrenotazione);
router.post('/cliente/prenotazioni/guasto', prenotazioneController.segnalaGuasto);

/* Gestione Autisti */

// Login Autisti

router.get('/accessoAutista', autistaController.getPaginaAccessoAutista);
router.post('/accessoAutista', autistaController.accedi);

// Prenotazioni Autisti
router.get('/autista/prenotazioni', autistaController.getPaginaPrenotazioniAutista);
router.post('/autista/prenotazioni/accetta', autistaController.accettaPrenotazione);
router.post('/autista/prenotazioni/rifiuta', autistaController.rifiutaPrenotazione);

// Routes non esistenti
router.get('/*', function(req, res, next) {
    next(createError(404));
});

module.exports = router;