const { DataTypes } = require('sequelize');
const sequelize = require('../database/database'); // Asegúrate de tener la conexión de Sequelize aquí

const Transaction = sequelize.define('Transaction', {
    transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    account_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'accounts', // Nombre de la tabla de cuentas, ajústalo si es necesario
            key: 'account_id'
        }
    },
    transaction_type: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    transaction_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'transactions' // Cambia el nombre de la tabla si es diferente
});

module.exports = Transaction;
