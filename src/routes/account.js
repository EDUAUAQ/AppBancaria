const express = require('express');
const account = express.Router();
const db = require('../database/database');

account.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = `SELECT user_id, username, email, first_name, last_name FROM users WHERE user_id = ${user_id}`;
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

module.exports = account;