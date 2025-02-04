const { makeDb, withTransaction } = require('../config/dbmiddleware');
const { config } = require('../config/config');
const mysql = require('mysql');
const util = require('util');

module.exports = {
    getParcheggi: async function() {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT * FROM Parcheggio')
                .catch(err => {
                    throw err;
                });
        });
        results = JSON.parse(JSON.stringify(results));
        return results;
    },

	getPrenotazioni: async function() {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT * FROM Prenotazione WHERE orarioArrivo > NOW()')
                .catch(err => {
                    throw err;
                });
        });
		
        results = JSON.parse(JSON.stringify(results));
		console.log(results);
        return results;
    },

    getPrenotazioneCliente: async function(idCliente, idPrenotazione) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT * FROM Prenotazione WHERE idCliente = ? and idPrenotazione=?', [ idCliente, idPrenotazione ])
                .catch(err => {
                    throw err;
                });
        });
		
        results = JSON.parse(JSON.stringify(results));

        results.forEach(element => {
            element.orarioArrivo = MySQLDateToObject(element.orarioArrivo);

            element.orarioPartenza = MySQLDateToObject(element.orarioPartenza);
        });

        return results;
    },

    getPrenotazioneCompletaCliente: async function(idCliente, idPrenotazione) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT * FROM Prenotazione pr '+
                                    'INNER JOIN (SELECT idParcheggio AS idParcheggioPartenza, indirizzo AS indirizzoPartenza '+
                                    'FROM Parcheggio) p1 ON pr.idParcheggioPartenza = p1.idParcheggioPartenza '+
                                    'INNER JOIN (SELECT idParcheggio AS idParcheggioArrivo, indirizzo AS indirizzoArrivo '+
                                    'FROM Parcheggio) p2 ON pr.idParcheggioArrivo = p2.idParcheggioArrivo '+
                                    'LEFT JOIN (SELECT idAutista, nome AS nomeAutista, cognome AS cognomeAutista '+
                                    'FROM Autista) a ON pr.idAutista = a.idAutista '+                                
                                    'WHERE pr.idCliente = ? AND pr.idPrenotazione = ?', [ idCliente, idPrenotazione ])
                .catch(err => {
                    throw err;
                });
        });
		
        results = JSON.parse(JSON.stringify(results));

        results.forEach(element => {
            element.orarioArrivo = MySQLDateToObject(element.orarioArrivo);

            element.orarioPartenza = MySQLDateToObject(element.orarioPartenza);
        });

        return results;
    },


    getPrenotazioniCliente: async function(idCliente) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT * FROM Prenotazione pr '+
                                'INNER JOIN (SELECT idParcheggio AS idParcheggioPartenza, indirizzo AS indirizzoPartenza '+
                                'FROM Parcheggio) p1 ON pr.idParcheggioPartenza = p1.idParcheggioPartenza '+
                                'INNER JOIN (SELECT idParcheggio AS idParcheggioArrivo, indirizzo AS indirizzoArrivo '+
                                'FROM Parcheggio) p2 ON pr.idParcheggioArrivo = p2.idParcheggioArrivo '+
                                'LEFT JOIN (SELECT idAutista, nome AS nomeAutista, cognome AS cognomeAutista '+
                                'FROM Autista) a ON pr.idAutista = a.idAutista '+                                
                                'WHERE pr.idCliente = ? ORDER BY pr.stato' , [ idCliente ])
                .catch(err => {
                    throw err;
                });
        });
		
        results = JSON.parse(JSON.stringify(results));

        results.forEach(element => {
            element.orarioArrivo = MySQLDateToObject(element.orarioArrivo);

            element.orarioPartenza = MySQLDateToObject(element.orarioPartenza);
        });

        return results;
    },
	
	getVeicoli: async function() {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT * FROM Veicolo')
                .catch(err => {
                    throw err;
                });
        });
        results = JSON.parse(JSON.stringify(results));
        return results;
    },

    getVeicolo: async function(idVeicolo) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT * FROM Veicolo WHERE idVeicolo = ?',[idVeicolo])
                .catch(err => {
                    throw err;
                });
        });
        results = JSON.parse(JSON.stringify(results));
        return results;
    },

    getPrenotazioniComplete: async function() {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT '+ 
                                            'idPrenotazione, stato, pr.idCliente, c.nome, c.cognome, '+ 
                                            'orarioPartenza, pr.idParcheggioPartenza, indirizzoPartenza, '+
                                            'orarioArrivo, pr.idParcheggioArrivo, indirizzoArrivo, '+
                                            'pr.idVeicolo, tipoVeicolo, targa, '+
                                            'a.idAutista, a.nomeAutista, a.cognomeAutista '+
                                    'FROM Prenotazione pr '+
                                    'INNER JOIN Cliente c ON pr.idCliente = c.idCliente '+
                                    'LEFT JOIN Veicolo v ON pr.idVeicolo = v.idVeicolo '+
                                    'INNER JOIN (SELECT idParcheggio AS idParcheggioPartenza, indirizzo AS indirizzoPartenza '+
                                                'FROM Parcheggio) p1 ON pr.idParcheggioPartenza = p1.idParcheggioPartenza '+
                                    'INNER JOIN (SELECT idParcheggio AS idParcheggioArrivo, indirizzo AS indirizzoArrivo '+
                                                'FROM Parcheggio) p2 ON pr.idParcheggioArrivo = p2.idParcheggioArrivo '+
                                    'LEFT JOIN (SELECT idAutista, nome AS nomeAutista, cognome AS cognomeAutista '+
                                                'FROM Autista) a ON pr.idAutista = a.idAutista ORDER BY pr.stato')
                .catch(err => {
                    throw err;
                });
        });
		
        results = JSON.parse(JSON.stringify(results));

        results.forEach(element => {
            let partenza = element.orarioPartenza.split('T');
            element.dataPartenza = partenza[0];
            element.orarioPartenza = partenza[1].substring(0, 5);

            let arrivo = element.orarioArrivo.split('T');
            element.dataArrivo = arrivo[0];
            element.orarioArrivo = arrivo[1].substring(0, 5);
        });
        return results;
    },

    modificaStato: async function(idPrenotazione, stato) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Prenotazione SET stato = ? WHERE idPrenotazione = ?', [
                    stato,
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    modificaParcheggioPartenza: async function(idPrenotazione, idParcheggioPartenza) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Prenotazione SET idParcheggioPartenza = ? WHERE idPrenotazione = ?', [
                    idParcheggioPartenza,
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    modificaParcheggioArrivo: async function(idPrenotazione, idParcheggioArrivo) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Prenotazione SET idParcheggioArrivo = ? WHERE idPrenotazione = ?', [
                    idParcheggioArrivo,
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    modificaPartenza: async function(idPrenotazione, dataPartenza, orarioPartenza) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Prenotazione SET orarioPartenza = ? WHERE idPrenotazione = ?', [
                    dataPartenza+" "+orarioPartenza,
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    modificaArrivo: async function(idPrenotazione, dataArrivo, orarioArrivo) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Prenotazione SET orarioArrivo = ? WHERE idPrenotazione = ?', [
                    dataArrivo+" "+orarioArrivo,
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    inserisciPrenotazione: async function(prenotazione) {
        const db = await makeDb(config);
        console.log(prenotazione);

        await withTransaction(db, async() => {
            if(prenotazione.autista) {
                await db.query('INSERT INTO Prenotazione '+     
                        '(orarioPartenza, orarioArrivo, stato, idCliente, tipoVeicolo, idParcheggioPartenza, '+
                        'idParcheggioArrivo, idMetodoPagamento, idAutista) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            prenotazione.dataPartenza+" "+prenotazione.orarioPartenza,
                            prenotazione.dataArrivo+" "+prenotazione.orarioArrivo,
                            'in attesa autista',
                            prenotazione.idCliente,
                            prenotazione.tipoVeicolo,
                            prenotazione.idParcheggioPartenza,
                            prenotazione.idParcheggioArrivo,
                            prenotazione.metodoPagamento,
                            await module.exports.getRandAutista(0)
                        ])
                    .catch(err => {
                        throw err;
                    });
            } else {
                await db.query('INSERT INTO Prenotazione '+     
                        '(orarioPartenza, orarioArrivo, stato, idCliente, tipoVeicolo, idParcheggioPartenza, '+
                        'idParcheggioArrivo, idMetodoPagamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [
                            prenotazione.dataPartenza+" "+prenotazione.orarioPartenza,
                            prenotazione.dataArrivo+" "+prenotazione.orarioArrivo,
                            'effettuata',
                            prenotazione.idCliente,
                            prenotazione.tipoVeicolo,
                            prenotazione.idParcheggioPartenza,
                            prenotazione.idParcheggioArrivo,
                            prenotazione.metodoPagamento
                        ])
                    .catch(err => {
                        throw err;
                    });
            }
        });
    
    },

    segnalaGuasto: async function(idPrenotazione) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Prenotazione SET stato = "guasto" WHERE idPrenotazione = ?', [ 
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    terminaPrenotazione: async function(idPrenotazione) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Prenotazione SET stato = "terminata" WHERE idPrenotazione = ?', [
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    cancellaPrenotazione: async function(idPrenotazione) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('DELETE FROM Prenotazione WHERE idPrenotazione = ?', [
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    iniziaPrenotazione: async function(idPrenotazione, idVeicolo) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Prenotazione SET stato = "in corso", idVeicolo = ? WHERE idPrenotazione = ?', [
                    idVeicolo,
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    getPrenotazioniAutista: async function(idAutista) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT * FROM Prenotazione pr '+
                                    'INNER JOIN (SELECT idParcheggio AS idParcheggioPartenza, indirizzo AS indirizzoPartenza '+
                                    'FROM Parcheggio) p1 ON pr.idParcheggioPartenza = p1.idParcheggioPartenza '+
                                    'INNER JOIN (SELECT idParcheggio AS idParcheggioArrivo, indirizzo AS indirizzoArrivo '+
                                    'FROM Parcheggio) p2 ON pr.idParcheggioArrivo = p2.idParcheggioArrivo '+
                                    'WHERE pr.idAutista = ? ORDER BY pr.stato', [ idAutista ])
                .catch(err => {
                    throw err;
                });
        });
		
        results = JSON.parse(JSON.stringify(results));

        results.forEach(element => {
            element.orarioArrivo = MySQLDateToObject(element.orarioArrivo);

            element.orarioPartenza = MySQLDateToObject(element.orarioPartenza);
        });

        return results;
    },

    getRandAutista: async function(idAutista) {     // restituisce un idAutista random escludendo l'id passato
        const db = await makeDb(config);
        let randId = {};
        await withTransaction(db, async() => {
            randId = await db.query('SELECT idAutista FROM Autista WHERE idAutista != ? ORDER BY RAND() LIMIT 1 ', [ idAutista ])
                .catch(err => {
                    throw err;
                });
        });

        return randId[0].idAutista;
    },

    accettaPrenotazione: async function(idPrenotazione, idAutista) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Prenotazione SET stato = "effettuata" WHERE idPrenotazione = ? AND idAutista = ?', [
                    idPrenotazione,
                    idAutista
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    rifiutaPrenotazione: async function(idPrenotazione, idAutista) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            results = await db.query('UPDATE Prenotazione SET idAutista = ? WHERE idPrenotazione = ? AND idAutista = ?', [
                    await module.exports.getRandAutista(idAutista),
                    idPrenotazione,
                    idAutista
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    riparaGuasto: async function(idPrenotazione) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Prenotazione SET stato = "terminata" WHERE idPrenotazione = ?', [
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    notificaRitardo: async function(motivazione, stimaConsegna, idPrenotazione) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('INSERT INTO Ritardo (motivazione, stimaConsegna, idPrenotazione) VALUES (?, ?, ?)', [
                    motivazione,
                    stimaConsegna,
                    idPrenotazione
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    rimuoviVeicoloDaParcheggio: async function(idVeicolo) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Veicolo SET idParcheggio = NULL  WHERE idVeicolo = ?', [
                    idVeicolo
                ])
                .catch(err => {
                    throw err;
                });
        });
    },

    mettiVeicoloInParcheggio: async function(idVeicolo, idParcheggio) {
        const db = await makeDb(config);
        await withTransaction(db, async() => {
            await db.query('UPDATE Veicolo SET idParcheggio = ?  WHERE idVeicolo = ?', [
                    idParcheggio,
                    idVeicolo
                ])
                .catch(err => {
                    throw err;
                });
        });
    },
}



function MySQLDateToObject(datetime) {
    res = datetime.split("T");
    data = res[0];
    orario = res[1];
    
    dataora = new Date(data);
    res = orario.split(":");
    ora = res[0];
    minuti = res[1];
    dataora.setHours(ora, minuti);

     //GMT+2
     dataora.setHours(dataora.getHours() + 2);

    return dataora;
  }