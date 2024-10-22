const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
//Routers
const user = require('./routes/user');
const account = require('./routes/account');
const transfer = require('./routes/transfers')

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
app.use(auth);
//Rutas Protegidas
app.use('/account',account);
app.use('/transfer',transfer)
app.use(notFound);

app.listen(PORT, ()=>{console.log(`Server listening on port ${PORT}`)})