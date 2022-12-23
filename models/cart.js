const Sequelize = require('sequelize');

const getDb = require('../util/database').getDb;

const Cart = sequelize.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = Cart;
