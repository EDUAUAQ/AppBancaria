const express = require('express');
const user = express.Router();
const db = require('../database/database');
const jwt = require('jsonwebtoken');

user.get("/profile/:user_id", async (req, res) => {
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


user.post("/signup",async(req,res,next)=>{
    const {user_name, user_mail, user_password, first_name, last_name} = req.body;

    if(user_name && user_mail && user_password && first_name && last_name){
        //Insert New User into Users
        let query = `INSERT INTO users(username, email, password, first_name, last_name) VALUES ('${user_name}','${user_mail}','${user_password}', '${first_name}', '${last_name}');`;

        const rows = await db.query(query);

        //Get New User Id
        query = `SELECT user_id FROM users WHERE username = '${user_name}';`

        const newUserId = await db.query(query);

        //Insert new user into a role
        query = `INSERT INTO userroles(user_id,role_id) VALUES (${newUserId[0].user_id}, 2)`

        const rolesrows = await db.query(query);

        if(rows.affectedRows == 1 && rolesrows.affectedRows == 1){
            return res.status(201).json({code:201, message:"Usuario registrado correctamente"});
        }
        return res.status(500).json({code:500, message:"Ocurrio un error"});
    }
    return res.status(500).json({code:500, message:"Campos Incompletos"});
});

user.post("/login", async (req, res, next) => {
    const { user_mail, user_password } = req.body;

    if (user_mail && user_password) {
        try {

            let query = `SELECT email, password FROM users WHERE email = '${user_mail}'`;
            
            const rows = await db.query(query);


            if (rows.length > 0) {
                const user = rows[0];


                if (user_password === user.password) { 

                    const token = jwt.sign({
                        user_id: user.user_id,
                        user_mail:user.user_mail
                    },"debugkey");

                    return res.status(200).json({ code: 200, token: token, message: "Inicio de Sesión Exitoso", userid: user.user_id });
                } else {
                    return res.status(401).json({ code: 401, message: "Contraseña incorrecta" });
                }
            } else {
                return res.status(404).json({ code: 404, message: "Usuario no encontrado" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ code: 500, message: "Ocurrió un error en el servidor" });
        }
    }

    return res.status(400).json({ code: 400, message: "Campos incompletos" });
});


module.exports = user;