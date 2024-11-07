const express = require('express');
const user = express.Router();
const User = require('../models/userModel'); // Importa el modelo User
const UserRole = require('../models/userRolesModel')
const jwt = require('jsonwebtoken');
const db = require('../database/database'); // Para la consulta SQL directa en roles

// GET /profile/:user_id
user.get("/profile/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        // Busca al usuario por su ID usando Sequelize
        const user = await User.findOne({
            attributes: ['user_id', 'username', 'email', 'first_name', 'last_name'],
            where: { user_id }
        });

        if (user) {
            return res.status(200).json({ code: 200, data: user });
        } else {
            return res.status(404).json({ code: 404, message: "Usuario no encontrado" });
        }
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Error en el servidor" });
    }
});

// POST /signup
user.post("/signup", async (req, res) => {
    const { user_name, user_mail, user_password, first_name, last_name } = req.body;

    if (user_name && user_mail && user_password && first_name && last_name) {
        try {
            // Crea el nuevo usuario con Sequelize
            const newUser = await User.create({
                username: user_name,
                email: user_mail,
                password: user_password,
                first_name,
                last_name
            });

            // Inserta el nuevo usuario en un rol específico (usando consulta SQL directa)
            const newUserRole = {
                user_id: newUser.user_id,
                role_id: 2
            };
            
            try {
                await UserRole.create(newUserRole);
                console.log('Role inserted successfully');
            } catch (error) {
                console.error('Error inserting role:', error);
            }

            return res.status(201).json({ code: 201, message: "Usuario registrado correctamente" });
        } catch (error) {
            return res.status(500).json({ code: 500, message: "Ocurrió un error al registrar el usuario" });
        }
    } else {
        return res.status(400).json({ code: 400, message: "Campos incompletos" });
    }
});

// POST /login
user.post("/login", async (req, res) => {
    const { user_mail, user_password } = req.body;

    if (user_mail && user_password) {
        try {
            // Busca al usuario por email usando Sequelize
            const user = await User.findOne({
                attributes: ['user_id', 'email', 'password', 'first_name'],
                where: { email: user_mail }
            });

            if (user) {
                // Verifica la contraseña (en un entorno real deberías usar hashes)
                if (user_password === user.password) {
                    // Genera el token JWT
                    const token = jwt.sign({
                        user_id: user.user_id,
                        user_mail: user.email,
                        user_password: user.password
                    }, "debugkey", { expiresIn: '30m' });
                    return res.status(200).json({ code: 200, token: token, message: "Inicio de Sesión Exitoso", userId: user.user_id, userName: user.first_name });
                } else {
                    return res.status(401).json({ code: 401, message: "Contraseña incorrecta" });
                }
            } else {
                return res.status(404).json({ code: 404, message: "Usuario no encontrado" });
            }
        } catch (error) {
            return res.status(500).json({ code: 500, message: "Ocurrió un error en el servidor" });
        }
    }

    return res.status(400).json({ code: 400, message: "Campos incompletos" });
});

module.exports = user;
