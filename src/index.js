const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
//Routers
const user = require('./routes/user');

//Middleware
const auth = require('./middleware/auth');
const notFound = require('./middleware/notFound');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'))
app.use(express.json());


app.use('/user',user);
app.use(auth);
//Rutas Protegidas
app.use(notFound);

app.listen(PORT, ()=>{console.log(`Server listening on port ${PORT}`)})