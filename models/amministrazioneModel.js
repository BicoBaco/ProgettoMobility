const { makeDb, withTransaction } = require('../config/dbmiddleware');
const { config } = require('../config/config');
const mysql = require('mysql');
const util = require('util');
const crypto = require('crypto');

module.exports = {   
    getAutisti: async function() {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            // ricavo i dati dal db
            results = await db.query('SELECT Autista.idAutista, nome, cognome, telefono, email FROM Autista, CredenzialiAutista WHERE Autista.idAutista=CredenzialiAutista.idAutista')
                .catch(err => {
                    throw err;
                });            
        });
        return results;
    },
    
    registrazioneAutista: async function(autistaData) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            // controllo se l'email è già esistente
            results = await db.query('SELECT * FROM CredenzialiAutista WHERE email = ?', [autistaData.email])
                .catch(err => {
                    throw err;
                });

            if(results.length != 0) {
                throw new Error("Email già utilizzata");
            }

            // generazione della password cifrata con SHA512
            results = await db.query('SELECT sha2(?,512) AS encpwd', [autistaData.password])
                .catch(err => {
                    throw err;
                });

            let encpwd = results[0].encpwd;
            console.log('Password cifrata');
            
            console.log(results);
            
            results = await db.query('INSERT INTO CredenzialiAutista (email, password) VALUES (?, ?)', [
                autistaData.email,
                    encpwd                    
                ])
                .catch(err => {
                    throw err;
                });

            
            console.log(`Credenziali Autista ${autistaData.email} inserite!`);

            let idAutista = results.insertId;
            results = await db.query('INSERT INTO Autista (idAutista, nome, cognome, telefono) VALUES (?, ?, ?, ?)', [
                idAutista,
                autistaData.nome,
                autistaData.cognome,
                autistaData.telefono,                    
            ])
            .catch(err => {
                throw err;
            });

            console.log(results);
            console.log(`Autista ${idAutista} ${autistaData.cognome} inserito!`);

            return idAutista;
        });
    },

    rimozioneAutista: async function(idAutista) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('DELETE FROM Autista WHERE idAutista = ?', [idAutista])
            .catch(err => {
                throw err;
            });
            results = await db.query('DELETE FROM CredenzialiAutista WHERE idAutista = ?', [idAutista])
                .catch(err => {
                    throw err;
                });
    
        });
    },

    aggiungiVeicolo: async function(veicoloData) {
        const db = await makeDb(config);
        let results = {};
        if(veicoloData.tipo == "automobile" || veicoloData.tipo == "moto") {
            results = await db.query('INSERT INTO Veicolo (tipo, codiceSblocco, targa, idParcheggio) VALUES (?, ?, ?, ?)', [veicoloData.tipo, Math.random().toString(36).slice(-8), veicoloData.targa, veicoloData.idParcheggio])
            .catch(err => {
                throw err;
            });
        } else {
            await withTransaction(db, async() => {
                results = await db.query('INSERT INTO Veicolo (tipo, codiceSblocco, idParcheggio) VALUES (?, ?, ?)', [veicoloData.tipo, Math.random().toString(36).slice(-8), veicoloData.idParcheggio])
                .catch(err => {
                    throw err;
                });       
            });

        }
    },

    spostaVeicolo: async function(idVeicolo, idParcheggio) {
        const db = await makeDb(config);
        let results = {};
        results = await db.query('UPDATE Veicolo SET idParcheggio = ? WHERE idVeicolo = ?', [idParcheggio, idVeicolo])
        .catch(err => {
            throw err;
        });
    },

    rimuoviVeicolo: async function(idVeicolo) {
        const db = await makeDb(config);
        let results = {};
        results = await db.query('DELETE FROM Veicolo WHERE idVeicolo = ?', [idVeicolo])
        .catch(err => {
            throw err;
        });
    },


    
}