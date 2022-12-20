const Seuelize = require("sequelize");

const sequelize = new Seuelize('node-complete', 'root', 'nodecomplete', {
    host: 'localhost',
    dialect: 'mysql'
})

module.exports = sequelize;
