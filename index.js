const express = require('express');
const app = express();
const bdd = require('./bdd');
const bcrypt = require("bcrypt");
const cors = require('cors');

app.use(cors());

const usersRoute = require('./routes/user');
const usersTask= require('./routes/task');


app.use(express.json());
app.use(usersTask);
app.use(usersRoute);


app.use('/api/user', usersRoute)
app.use('/api/task', usersTask)


app.listen(3001, () => {
    console.log("je suis sur le port 3001");
});

