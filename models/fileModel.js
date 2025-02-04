const { makeDb, withTransaction } = require('../config/dbmiddleware');
const { config } = require('../config/config');
const mysql = require('mysql');
const util = require('util');

module.exports = {
    getDocumenti: async function(idCliente) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT idDocumento, idCliente, tipologia, foto FROM DocumentoCliente WHERE idCliente = ?', [
                    idCliente
                ])
                .catch(err => {
                    throw err;
                });
        });
        console.log(results);
        return results;
    },

    aggiungiDocumento: async function(documento) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('INSERT INTO DocumentoCliente (idCliente, tipologia, foto) VALUES (?, ?, ?)', [
                    documento.idCliente,
                    documento.tipologia,
                    documento.estensione
                ])
                .catch(err => {
                    throw err;
                });
        });
        return results.insertId;
    },

    rimuoviDocumento: async function(documento) {
        const db = await makeDb(config);
        
        await withTransaction(db, async() => {
            let results = {};

            // controllo che il documento da rimuovere appartenga al cliente
            results = await db.query('SELECT * FROM DocumentoCliente WHERE (idDocumento, idCliente) = (?, ?)', 
                [
                    documento.idDocumento, 
                    documento.idCliente
                ])
                .catch(err => {
                    throw err;
                });

            if(results.length == 0) {
                throw new Error("Errore interno");
            }

            await db.query('DELETE FROM DocumentoCliente WHERE (idDocumento, idCliente) = (?, ?)', 
                [
                    documento.idDocumento, 
                    documento.idCliente                  
                ])
                .catch(err => {
                    throw err;
                });
         
            console.log(`Documento ${documento.idDocumento} eliminato!`);
        });
    }
}