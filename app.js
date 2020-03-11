// this file holds express app

// importing express installed through npm
const express = require('express');

// executing imported express as a function which will return express as an app
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const postRoutes = require('./routes/posts');
const path = require('path');
const userRoutes = require('./routes/user');

const mongoDb = process.env.MONGODB_URL || 'mongodb://localhost:27017/node-angular';

mongoose.connect(mongoDb, { useNewUrlParser: true })
// connect method is returning a promise which is then
    .then(() => {
    console.log('DB: Connect OK!');
    })
// catching any potential error thrown by connect method
    .catch(err =>
         console.log('Connection to db failed' + err));
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use('/images', express.static(path.join('images')));
app.use(cors());


// notes => express app is actually a big chain of middlewares we apply to incoming requests
// which can read values, send responses


// we can use middleware through use keyword, next keyword continues request to the next middleware if used inside body of middleware next()
// app.use( (req, res, next) => {
//     console.log("Hello form first middleware");
//     next();
// });

app.use('/posts', postRoutes);
app.use('/user', userRoutes);


module.exports = app;