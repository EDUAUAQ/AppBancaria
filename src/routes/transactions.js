const express = require('express');
const transaction = express.Router();
const db = require('../database/database');

// Obtener transacciones
transaction.get("/:account_id", async (req, res) => {
    const { account_id } = req.params;

    try {
        // Consultar transacciones por account_id
        const query = `SELECT * FROM transactions WHERE account_id = ${account_id}`;
        const transactions = await db.query(query);

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
    if (!account_id || !transaction_type || !amount) {
        return res.status(400).json({ code: 400, message: "Datos incompletos" });
    }

    // Verificar que el tipo de transacción sea válido
    if (!['Compra', 'Retiro'].includes(transaction_type)) {
        return res.status(400).json({ code: 400, message: "Tipo de transacción no válido" });
    }

    try {
        // Consultar saldo y tipo de cuenta
        const queryCheckAccount = `SELECT balance, account_type FROM accounts WHERE account_id = ${account_id}`;
        const [account] = await db.query(queryCheckAccount);

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

        // Crear la consulta SQL para insertar una nueva transacción
        const queryInsertTransaction = `
            INSERT INTO transactions (account_id, transaction_type, amount, transaction_date, description) 
            VALUES (${account_id}, '${transaction_type}', ${amount}, NOW(), '${description}')
        `;

        // Ejecutar la consulta para insertar la transacción
        await db.query(queryInsertTransaction);

        if (account.account_type === 'Débito') {
            amount = -amount; // Convertir a negativo para el saldo
        }

        // Actualizar el saldo de la cuenta
        const queryUpdateAccount = `
            UPDATE accounts SET balance = balance + ${amount} WHERE account_id = ${account_id}
        `;
        await db.query(queryUpdateAccount);

        
        // Responder con éxito
        return res.status(201).json({ code: 201, message: "Transacción realizada exitosamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});


module.exports = transaction;
