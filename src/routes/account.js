const express = require('express');
const account = express.Router();
const db = require('../database/database');

account.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = `SELECT * FROM accounts WHERE user_id = ${user_id}`;
        const accounts = await db.query(query);
        if (accounts.length >= 0) {
            return res.status(200).json({ code: 200, data: accounts });
        } else {
            return res.status(404).json({ code: 404, message: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

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
        const queryCheck = `SELECT * FROM accounts WHERE account_id = '${account_id}'`;
        const existingAccount = await db.query(queryCheck);

        exists = existingAccount.length > 0; 
    }

    try {
        // Crear la consulta SQL para insertar la nueva cuenta
        const query = `INSERT INTO accounts (account_id, user_id, account_type, balance) VALUES ('${account_id}', ${user_id}, '${account_type}', ${balance})`;

        // Ejecutar la consulta
        await db.query(query);

        // Responder con éxito
        return res.status(201).json({ code: 201, message: "Cuenta creada exitosamente", account_id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});




module.exports = account;