const { makeDb, withTransaction } = require('../config/dbmiddleware');
const { config } = require('../config/config');
const mysql = require('mysql');
const util = require('util');
const crypto = require('crypto');

module.exports = {
    autenticazione: async function(autistaData) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            // controllo l'esistenza della email
            results = await db.query('SELECT * FROM CredenzialiAutista WHERE email = ?', [
                    autistaData.email
                ])
                .catch(err => {
                    throw err;
                });
            if (results.length == 0) {
                console.log('Email e/o password errati');
                throw new Error("Email e/o password errati");
            } else {
                let pwdhash = crypto.createHash('sha512'); // istanziamo l'algoritmo di hashing
                pwdhash.update(autistaData.password); // cifriamo la password
                let encpwd = pwdhash.digest('hex'); // otteniamo la stringa esadecimale

                if (encpwd != results[0].password) {
                    // password non coincidenti
                    console.log('Email e/o password errati');
                    throw new Error("Email e/o password errati");
                } else {
                    console.log('Autista autenticato');
                    console.log(results);
                }
            }
        });

        return results[0].idAutista;
    },


}