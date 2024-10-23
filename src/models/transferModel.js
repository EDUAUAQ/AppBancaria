const { DataTypes } = require('sequelize');
const sequelize = require('../database/database'); // Asegúrate de tener la conexión de Sequelize aquí

const Transfer = sequelize.define('Transfer', {
    transfer_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    from_account_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'accounts', // Nombre de la tabla a la que hace referencia
            key: 'account_id'
        }
    },
    to_account_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: 'accounts', // Nombre de la tabla a la que hace referencia
            key: 'account_id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    transfer_date: {
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
    tableName: 'transfers' // Nombre de la tabla en la base de datos
});

module.exports = Transfer;
