const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
//Routers
const user = require('./routes/user');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'))
app.use(express.json());

app.use('/user',user);

app.listen(PORT, ()=>{console.log(`Server listening on port ${PORT}`)})