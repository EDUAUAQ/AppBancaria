const express = require('express');
const transfer = express.Router();
const db = require('../database/database');

// Obtener todas las transferencias de una cuenta (por account_id)
transfer.get("/:account_id", async (req, res) => {
    const { account_id } = req.params;

    try {
        const query = `SELECT * FROM transfers WHERE from_account_id = ${account_id} OR to_account_id = ${account_id}`;
        const transfers = await db.query(query);

        if (transfers.length >= 0) {
            return res.status(200).json({ code: 200, data: transfers });
        } else {
            return res.status(404).json({ code: 404, message: "No se encontraron transferencias para la cuenta" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

transfer.post("/create", async (req, res) => {
    const { from_account_id, to_account_id, amount, description } = req.body;

    // Verificar si los datos requeridos están presentes
    if (!from_account_id || !to_account_id || !amount) {
        return res.status(400).json({ code: 400, message: "Datos incompletos" });
    }

    try {
        // Consultar saldo y tipo de cuenta del remitente
        const queryCheckFromAccount = `SELECT balance, account_type FROM accounts WHERE account_id = ${from_account_id}`;
        const [fromAccount] = await db.query(queryCheckFromAccount);

        if (!fromAccount) {
            return res.status(404).json({ code: 404, message: "Cuenta del remitente no encontrada" });
        }

        // Verificar que la cuenta de origen no sea de crédito
        if (fromAccount.account_type === 'Crédito') {
            return res.status(400).json({ code: 400, message: "No se pueden hacer transferencias desde cuentas de crédito" });
        }

        // Verificar que la cuenta de destino no sea la misma que la de origen
        if (from_account_id === to_account_id) {
            return res.status(400).json({ code: 400, message: "La cuenta destino no puede ser igual a la cuenta origen" });
        }

        // Consultar saldo y tipo de cuenta del destinatario
        const queryCheckToAccount = `SELECT balance, account_type FROM accounts WHERE account_id = ${to_account_id}`;
        const [toAccount] = await db.query(queryCheckToAccount);

        if (!toAccount) {
            return res.status(404).json({ code: 404, message: "Cuenta del destinatario no encontrada" });
        }

        // Verificar si el saldo es suficiente para cuentas que no son de crédito
        if (fromAccount.balance < amount) {
            return res.status(400).json({ code: 400, message: "Saldo insuficiente" });
        }

        // Crear la consulta SQL para insertar una nueva transferencia
        const queryInsertTransfer = `
            INSERT INTO transfers (from_account_id, to_account_id, amount, description) 
            VALUES (${from_account_id}, ${to_account_id}, ${amount}, '${description}')
        `;

        // Ejecutar la consulta para insertar la transferencia
        await db.query(queryInsertTransfer);

        // Actualizar el saldo de la cuenta remitente
        const queryUpdateFromAccount = `
            UPDATE accounts SET balance = balance - ${amount} WHERE account_id = ${from_account_id}
        `;
        await db.query(queryUpdateFromAccount);

        // Si la cuenta de destino es de crédito, se le resta el monto transferido (negativo es a favor)
        if (toAccount.account_type === 'Crédito') {
            const queryUpdateToAccount = `
                UPDATE accounts SET balance = balance - ${amount} WHERE account_id = ${to_account_id}
            `;
            await db.query(queryUpdateToAccount);
        } else {
            // Si la cuenta de destino no es de crédito, se suma el monto transferido
            const queryUpdateToAccount = `
                UPDATE accounts SET balance = balance + ${amount} WHERE account_id = ${to_account_id}
            `;
            await db.query(queryUpdateToAccount);
        }

        // Responder con éxito
        return res.status(201).json({ code: 201, message: "Transferencia realizada exitosamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});


// Eliminar una transferencia por transfer_id
transfer.delete("/:transfer_id", async (req, res) => {
    const { transfer_id } = req.params;

    try {
        // Verificar si la transferencia existe
        const queryCheck = `SELECT * FROM transfers WHERE transfer_id = ${transfer_id}`;
        const transfer = await db.query(queryCheck);

        if (transfer.length === 0) {
            return res.status(404).json({ code: 404, message: "Transferencia no encontrada" });
        }

        // Eliminar la transferencia
        const query = `DELETE FROM transfers WHERE transfer_id = ${transfer_id}`;
        await db.query(query);

        return res.status(200).json({ code: 200, message: "Transferencia eliminada exitosamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

module.exports = transfer;
