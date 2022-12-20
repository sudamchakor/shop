const Seuelize = require("sequelize");

const sequelize = new Seuelize('shop', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;
