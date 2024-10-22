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

// Crear una nueva transferencia
transfer.post("/create", async (req, res) => {
    const { from_account_id, to_account_id, amount, description } = req.body;

    // Verificar si los datos requeridos están presentes
    if (!from_account_id || !to_account_id || !amount) {
        return res.status(400).json({ code: 400, message: "Datos incompletos" });
    }

    try {
        // Consultar el saldo de la cuenta del remitente
        const queryCheckBalance = `SELECT balance FROM accounts WHERE account_id = ${from_account_id}`;
        const [fromAccount] = await db.query(queryCheckBalance);

        if (!fromAccount) {
            return res.status(404).json({ code: 404, message: "Cuenta del remitente no encontrada" });
        }

        // Verificar si el saldo es suficiente
        if (fromAccount.balance < amount ) {
            return res.status(400).json({ code: 400, message: "Saldo insuficiente" });
        }

        if (from_account_id == to_account_id ) {
            return res.status(400).json({ code: 400, message: "La cuenta destino no puede ser igual a la cuenta origen" });
        }

        // Crear la consulta SQL para insertar una nueva transferencia
        const queryInsertTransfer = `
            INSERT INTO transfers (from_account_id, to_account_id, amount, description) 
            VALUES (${from_account_id}, ${to_account_id}, ${amount}, '${description}')
        `;

        // Ejecutar la consulta para insertar la transferencia
        await db.query(queryInsertTransfer);

        // Actualizar el saldo de las cuentas
        const queryUpdateFromAccount = `
            UPDATE accounts SET balance = balance - ${amount} WHERE account_id = ${from_account_id}
        `;
        const queryUpdateToAccount = `
            UPDATE accounts SET balance = balance + ${amount} WHERE account_id = ${to_account_id}
        `;

        // Ejecutar las actualizaciones de saldo
        await db.query(queryUpdateFromAccount);
        await db.query(queryUpdateToAccount);

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
