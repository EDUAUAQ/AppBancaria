const { DataTypes } = require('sequelize');
const sequelize = require('../database/database'); // Asegúrate de tener la conexión de Sequelize aquí

const Account = sequelize.define('Account', {
    account_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users', // Nombre de la tabla de usuarios, ajústalo si es necesario
            key: 'user_id'
        }
    },
    account_type: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
}, {
    timestamps: false,
    tableName: 'accounts' // Cambia el nombre de la tabla si es diferente
});

module.exports = Account;
