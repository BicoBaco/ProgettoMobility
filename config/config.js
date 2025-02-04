exports.config = {
    connectionLimit: 10,
    host: _host_address_,
    user: _username_,
    password: _password_,
    database: _dbname_,
    multipleStatements: true // consente query multiple in un'unica istruzione SQL
}