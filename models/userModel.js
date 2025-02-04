const { makeDb, withTransaction } = require('../config/dbmiddleware');
const { config } = require('../config/config');
const mysql = require('mysql');
const util = require('util');
const crypto = require('crypto');

module.exports = {
    registrazione: async function(userData) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            // controllo se l'email è già esistente
            results = await db.query('SELECT * FROM CredenzialiCliente WHERE email = ?', [userData.email])
                .catch(err => {
                    throw err;
                });

            if(results.length != 0) {
                throw new Error("Email già utilizzata");
            }

            // generazione della password cifrata con SHA512
            results = await db.query('SELECT sha2(?,512) AS encpwd', [userData.password])
                .catch(err => {
                    throw err;
                });

            let encpwd = results[0].encpwd;
            console.log('Password cifrata');
            
            console.log(results);
            
            results = await db.query('INSERT INTO CredenzialiCliente (email, password) VALUES (?, ?)', [
                    userData.email,
                    encpwd                    
                ])
                .catch(err => {
                    throw err;
                });

            
            console.log(`Credenziali Utente ${userData.email} inserite!`);

            let idCliente = results.insertId;
            await db.query('INSERT INTO Cliente (idCliente, nome, cognome, telefono) VALUES (?, ?, ?, ?)', [
                idCliente,
                userData.nome,
                userData.cognome,
                userData.telefono,                    
            ])
            .catch(err => {
                throw err;
            });

            console.log(`Utente ${idCliente} ${userData.cognome} inserito!`);
        });

        return results.insertId;
    },

    autenticazione: async function(userData) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            // controllo l'esistenza della email
            results = await db.query('SELECT * FROM CredenzialiCliente WHERE email = ?', [
                    userData.email
                ])
                .catch(err => {
                    throw err;
                });
            if (results.length == 0) {
                console.log('Utente e/o password errati');
                throw new Error("Utente e/o password errati");
            } else {
                let pwdhash = crypto.createHash('sha512'); // istanziamo l'algoritmo di hashing
                pwdhash.update(userData.password); // cifriamo la password
                let encpwd = pwdhash.digest('hex'); // otteniamo la stringa esadecimale

                if (encpwd != results[0].password) {
                    // password non coincidenti
                    console.log('Utente e/o password errati');
                    throw new Error("Utente e/o password errati");
                } else {
                    console.log('Utente autenticato');
                    console.log(results);
                }
            }
        });

        return results[0].idCliente;
    },

    getUtente: async function(idCliente) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            // ricavo i dati dal db
            results = await db.query('SELECT email, nome, cognome, telefono FROM CredenzialiCliente AS cc, Cliente AS c WHERE cc.idCliente = c.idCliente AND cc.idCliente = ?', [
                    idCliente
                ])
                .catch(err => {
                    throw err;
                });

            if (results.length == 0) 
                throw new Error("Errore interno");
        });
        return results;
    },

    modificaNome: async function(idCliente, nome) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('UPDATE Cliente SET nome = ? WHERE idCliente = ?', [
                    nome,
                    idCliente
                ])
                .catch(err => {
                    throw err;
                });

            if (results.length == 0) 
                throw new Error("Errore interno");
        });
        return results;
    }, 

    modificaCognome: async function(idCliente, cognome) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('UPDATE Cliente SET cognome = ? WHERE idCliente = ?', [
                    cognome,
                    idCliente
                ])
                .catch(err => {
                    throw err;
                });

            if (results.length == 0) 
                throw new Error("Errore interno");
        });
        return results;
    },

    modificaEmail: async function(idCliente, email) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('UPDATE CredenzialiCliente SET email = ? WHERE idCliente = ?', [
                    email,
                    idCliente
                ])
                .catch(err => {
                    throw err;
                });

            if (results.length == 0) 
                throw new Error("Errore interno");
        });
        return results;
    },

    modificaTelefono: async function(idCliente, telefono) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('UPDATE Cliente SET telefono = ? WHERE idCliente = ?', [
                    telefono,
                    idCliente
                ])
                .catch(err => {
                    throw err;
                });

            if (results.length == 0) 
                throw new Error("Errore interno");
        });
        return results;
    }
}