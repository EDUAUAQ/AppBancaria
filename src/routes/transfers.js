const express = require('express');
const transfer = express.Router();
const { Op } = require('sequelize');
const Transfer = require('../models/transferModel'); // Modelo de transferencia
const Account = require('../models/accountModel'); // Modelo de cuenta

// Obtener todas las transferencias de una cuenta (por account_id)
transfer.get("/:account_id", async (req, res) => {
    const { account_id } = req.params;

    try {
        const transfers = await Transfer.findAll({
            where: {
                [Op.or]: [
                    { from_account_id: account_id },
                    { to_account_id: account_id }
                ]
            }
        });

        if (transfers.length > 0) {
            return res.status(200).json({ code: 200, data: transfers });
        } else {
            return res.status(404).json({ code: 404, message: "No se encontraron transferencias para la cuenta" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

// Crear transferencia
transfer.post("/create", async (req, res) => {
    const { from_account_id, to_account_id, amount, description } = req.body;

    // Verificar si los datos requeridos están presentes
    if (!from_account_id || !to_account_id || !amount) {
        return res.status(400).json({ code: 400, message: "Datos incompletos" });
    }

    try {
        // Consultar saldo y tipo de cuenta del remitente
        const fromAccount = await Account.findOne({ where: { account_id: from_account_id } });

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
        const toAccount = await Account.findOne({ where: { account_id: to_account_id } });

        if (!toAccount) {
            return res.status(404).json({ code: 404, message: "Cuenta del destinatario no encontrada" });
        }

        // Verificar si el saldo es suficiente para cuentas que no son de crédito
        if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
            return res.status(400).json({ code: 400, message: "Saldo insuficiente" });
        }

        // Crear la nueva transferencia
        const transferData = await Transfer.create({
            from_account_id,
            to_account_id,
            amount,
            description
        });

        
        const newBalanceFrom = parseFloat(fromAccount.balance) - parseFloat(amount)
        // Actualizar el saldo de la cuenta remitente
        await Account.update(
            { balance: newBalanceFrom },
            { where: { account_id: from_account_id } }
        );

        // Actualizar el saldo de la cuenta de destino
        if (toAccount.account_type === 'Crédito') {
            const newBalance = parseFloat(toAccount.balance) - parseFloat(amount)
            await Account.update(
                { balance: newBalance },
                { where: { account_id: to_account_id } }
            );
        } else {
            const newBalance = parseFloat(toAccount.balance) + parseFloat(amount)
            await Account.update(
                { balance: newBalance },
                { where: { account_id: to_account_id } }
            );
        }

        // Responder con éxito
        return res.status(201).json({ code: 201, message: "Transferencia realizada exitosamente", transferData });
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
        const transfer = await Transfer.findOne({ where: { transfer_id } });

        if (!transfer) {
            return res.status(404).json({ code: 404, message: "Transferencia no encontrada" });
        }

        // Eliminar la transferencia
        await Transfer.destroy({ where: { transfer_id } });

        return res.status(200).json({ code: 200, message: "Transferencia eliminada exitosamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

module.exports = transfer;
