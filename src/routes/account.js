const express = require('express');
const account = express.Router();
const db = require('../database/database');

account.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = `SELECT * FROM accounts WHERE user_id = ${user_id}`;
        const user = await db.query(query);

        if (user.length > 0) {
            return res.status(200).json({ code: 200, data: user[0] });
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

    try {
        // Crear la consulta SQL para insertar la nueva cuenta
        const query = `INSERT INTO accounts (user_id, account_type, balance) VALUES (${user_id}, '${account_type}', ${balance})`;

        // Ejecutar la consulta
        await db.query(query);

        // Responder con éxito
        return res.status(201).json({ code: 201, message: "Cuenta creada exitosamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});


module.exports = account;