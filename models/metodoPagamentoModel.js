const { makeDb, withTransaction } = require('../config/dbmiddleware');
const { config } = require('../config/config');
const mysql = require('mysql');
const util = require('util');

module.exports = {
    getMetodiPagamento: async function(idCliente) {
        const db = await makeDb(config);
        let results = {};
        await withTransaction(db, async() => {
            results = await db.query('SELECT idMetodoPagamento, numeroCarta, dataScadenza FROM CredenzialiCliente AS cc, MetodoDiPagamento AS m WHERE cc.idCliente = m.idCliente AND cc.idCliente = ?', [
                    idCliente
                ])
                .catch(err => {
                    throw err;
                });
        });
        
        if (results.length != 0) {
            results=JSON.parse(JSON.stringify(results));
            
            let temp;

            results.forEach(element => {
                element.numeroCarta = element.numeroCarta.substring(element.numeroCarta.length - 4, element.numeroCarta.length);
                temp = element.dataScadenza.split('-');
                element.dataScadenza = temp[1]+"/"+temp[0].substring(2, 4);
            });
        }
        
        return results;
    },

    aggiungiMetodoPagamento: async function(userData) {
        const db = await makeDb(config);
        
        await withTransaction(db, async() => {
            let results = {};

            // controllo se la carta è già stata aggiunta dallo stesso utente
            results = await db.query('SELECT * FROM MetodoDiPagamento WHERE (numeroCarta, idCliente) = (?, ?)', [userData.numeroCarta, userData.idCliente])
                .catch(err => {
                    throw err;
                });

            if(results.length != 0) {
                throw new Error("Hai già inserito questa carta");
            }

            data = userData.dataScadenza.split('/');
            data = "20"+data[1]+"-"+data[0]+"-02";
            await db.query('INSERT INTO MetodoDiPagamento (idCliente, numeroCarta, dataScadenza, CVV) VALUES (?, ?, ?, ?)', [
                    userData.idCliente,
                    userData.numeroCarta,
                    data,
                    userData.cvv                    
                ])
                .catch(err => {
                    throw err;
					console.log(userData.idCliente);
                });
            
            console.log(`Carta ${userData.numeroCarta} inserita!`);
        });
    },

    rimuoviMetodoPagamento: async function(userData) {
        const db = await makeDb(config);
        
        await withTransaction(db, async() => {
            let results = {};

            // controllo se l'utente possiede la carta
            results = await db.query('SELECT * FROM MetodoDiPagamento WHERE (idMetodoPagamento, idCliente) = (?, ?)', 
                [
                    userData.idMetodoPagamento, 
                    userData.idCliente
                ])
                .catch(err => {
                    throw err;
                });

            if(results.length == 0) {
                throw new Error("Errore interno");
            }

            await db.query('DELETE FROM MetodoDiPagamento WHERE (idMetodoPagamento, idCliente) = (?, ?)', 
                [
                    userData.idMetodoPagamento,
                    userData.idCliente,                  
                ])
                .catch(err => {
                    throw err;
                });
         
            console.log(`Carta ${userData.numeroCarta} eliminata!`);
        });
    }
}