const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const sequelize = require('./database/database');
//Routers
const user = require('./routes/user');
const account = require('./routes/account');
const transfer = require('./routes/transfers');
const transactions = require('./routes/transactions');

//Middleware
const auth = require('./middleware/auth');
const notFound = require('./middleware/notFound');
require('dotenv').config();

const app = express();

const PORT = process.env.DB_PORT || 3000;

app.use(cors());
app.use(morgan('dev'))
app.use(express.json());


app.use('/user',user);
app.use('/transaction', transactions)
app.use(auth);
//Rutas Protegidas
app.use('/account',account);
app.use('/transfer',transfer)
app.use(notFound);

sequelize.sync()
    .then(() => {
        console.log('Conexión con la base de datos establecida.');
        app.listen(3000, () => {
        console.log('Servidor ejecutándose en el puerto 3000');
        });
    })
    .catch(err => {
        console.error('Error conectando con la base de datos:', err);
    });