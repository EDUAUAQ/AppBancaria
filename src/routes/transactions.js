const express = require('express');
const transaction = express.Router();
const Transaction = require('../models/transactionModel'); // Asegúrate de que la ruta sea correcta
const Account = require('../models/accountModel'); // Para consultar el saldo de la cuenta

// Obtener transacciones por account_id
transaction.get("/:account_id", async (req, res) => {
    const { account_id } = req.params;

    try {
        // Consultar transacciones por account_id
        const transactions = await Transaction.findAll({
            where: { account_id }
        });

        if (transactions.length > 0) {
            return res.status(200).json({ code: 200, data: transactions });
        } else {
            return res.status(404).json({ code: 404, message: "No se encontraron transacciones para esta cuenta", account_id });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

// Crear transacción
transaction.post("/create", async (req, res) => {
    let { account_id, transaction_type, amount, description } = req.body;

    // Verificar si los datos requeridos están presentes
    if (!account_id || !transaction_type || amount === undefined) {
        return res.status(400).json({ code: 400, message: "Datos incompletos" });
    }

    // Verificar que el tipo de transacción sea válido
    if (!['Compra', 'Retiro'].includes(transaction_type)) {
        return res.status(400).json({ code: 400, message: "Tipo de transacción no válido" });
    }

    try {
        // Consultar saldo y tipo de cuenta
        const account = await Account.findOne({
            where: { account_id }
        });

        if (!account) {
            return res.status(404).json({ code: 404, message: "Cuenta no encontrada" });
        }

        // Lógica para cuentas de débito y crédito
        if (transaction_type === 'Retiro') {
            // Para retiros, verificar que el saldo sea suficiente si es cuenta de débito
            if (account.account_type === 'Débito' && account.balance < amount) {
                return res.status(400).json({ code: 400, message: "Saldo insuficiente para el retiro" });
            }
        } else if (transaction_type === 'Compra') {
            // Para compras, verificar que el saldo sea suficiente
            if (account.account_type === 'Débito' && account.balance < amount) {
                return res.status(400).json({ code: 400, message: "Saldo insuficiente para la compra" });
            }
        }

        // Crear la nueva transacción
        const newTransaction = await Transaction.create({
            account_id,
            transaction_type,
            amount,
            description
        });

        // Actualizar el saldo de la cuenta
        let newBalance = account.balance;
        if (account.account_type === 'Débito') {
            newBalance = parseFloat(newBalance) - parseFloat(amount); // Resta el monto en caso de cuenta de débito
        } else {
            newBalance = parseFloat(newBalance) + parseFloat(amount); // Suma el monto en caso de cuenta de crédito
        }

        // Actualizar el saldo en la base de datos
        await Account.update({ balance: newBalance }, {
            where: { account_id }
        });

        // Responder con éxito
        return res.status(201).json({ code: 201, message: "Transacción realizada exitosamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

module.exports = transaction;
