const express = require('express');
//Routers
const user = require('./routes/user');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/user',user);

app.listen(PORT, ()=>{console.log(`Server listening on port ${PORT}`)})