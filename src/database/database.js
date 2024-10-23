require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configura la conexión a tu base de datos con Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',  // Cambia a 'postgres' si usas PostgreSQL
    logging: false,
    define: {
        freezeTableName: true,  // Evita que Sequelize cambie el nombre de las tablas
    }
});

module.exports = sequelize;
