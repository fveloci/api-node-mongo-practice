const users = require('./routes/users');
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const express = require('express');
const mongoose = require('mongoose')
const config = require('config')

// Connect to database
mongoose.connect(config.get('configDB.HOST'), {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(() => console.log('Conected to MongoDB'))
    .catch((e) => console.log('Connection refused to MongoDB...', e))

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/users', users);
app.use('/api/courses', courses);
app.use('/api/auth', auth);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Api RESTful executing...')
})