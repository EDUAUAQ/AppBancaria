const express = require('express');
const user = express.Router();
const db = require('../database/database');


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

module.exports = user;