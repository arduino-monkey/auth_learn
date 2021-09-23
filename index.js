const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
const resetRoute = require('./routes/reset');
const confirmRoute = require('./routes/confirmation');

dotenv.config();

mongoose.connect(process.env.DB_CONNECT, 
    () => console.log('connected to DB')
);

//middlewares
app.use(express.json());

//Route middlewares
app.use('/api/user', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/user', resetRoute);
app.use('/api/user', confirmRoute);

app.listen(3000, () => console.log('server running'));