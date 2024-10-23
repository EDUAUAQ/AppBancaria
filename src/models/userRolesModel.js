const { DataTypes } = require('sequelize');
const sequelize = require('../database/database'); // Asegúrate de tener la conexión de Sequelize aquí

const UserRole = sequelize.define('UserRole', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    }
}, {
    timestamps: false,
    tableName: 'userroles' // Cambia el nombre de la tabla si es diferente
});

module.exports = UserRole;
