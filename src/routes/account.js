const express = require('express');
const account = express.Router();
const Account = require('../models/accountModel');

// Obtener cuentas por user_id
account.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const accounts = await Account.findAll({
            where: { user_id }
        });

        if (accounts.length > 0) {
            return res.status(200).json({ code: 200, data: accounts });
        } else {
            return res.status(200).json({ code: 400, data:accounts , message: "No tienes cuentas asociadas" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

// Obtener detalles de una cuenta por account_id
account.get("/details/:account_id", async (req, res) => {
    const { account_id } = req.params;

    try {
        // Buscar la cuenta por account_id
        const accountDetails = await Account.findOne({
            where: { account_id }
        });

        // Verificar si la cuenta existe
        if (accountDetails) {
            console.log(accountDetails)
            return res.status(200).json({ code: 200, data: accountDetails });
        } else {
            return res.status(404).json({ code: 404, message: "La cuenta no existe" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

// Crear una nueva cuenta
account.post("/create", async (req, res) => {
    const { user_id, account_type, balance } = req.body;

    // Verificar si los datos requeridos están presentes
    if (!user_id || !account_type || balance === undefined) {
        return res.status(400).json({ code: 400, message: "Datos incompletos" });
    }

    // Función para generar un account_id tipo tarjeta de crédito/débito
    const generateAccountId = () => {
        let accountId = '';
        for (let i = 0; i < 16; i++) {
            accountId += Math.floor(Math.random() * 10); // Genera un dígito aleatorio (0-9)
        }
        return accountId;
    };

    let account_id;
    let exists = true;

    // Generar un account_id único
    while (exists) {
        account_id = generateAccountId();

        // Verificar si el account_id ya existe en la base de datos
        const existingAccount = await Account.findOne({
            where: { account_id }
        });

        exists = existingAccount !== null; 
    }

    try {
        // Crear la nueva cuenta
        const newAccount = await Account.create({
            account_id,
            user_id,
            account_type,
            balance
        });

        // Responder con éxito
        return res.status(201).json({ code: 201, message: "Cuenta creada exitosamente", account_id: newAccount.account_id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

module.exports = account;
