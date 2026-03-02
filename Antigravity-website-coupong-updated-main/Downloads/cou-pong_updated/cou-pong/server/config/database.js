const { Sequelize } = require('sequelize');

// Create SQLite Database connection
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Local storage
    logging: false // Toggle to true to see SQL queries
});

module.exports = sequelize;
