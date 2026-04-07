
const { urlencoded } = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const rateLimit = require('express-rate-limit');

const app = express();

// Limit repeated login attempts to mitigate brute-force and DoS attacks on the login endpoint
const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,                  // limit each IP to 5 requests per window
    standardHeaders: true,   // return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false     // disable the `X-RateLimit-*` headers
});

app.use(urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = {
    email: String,
    password: String
};

const User = new mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save((err) => {
        if (err) {
            console.log(err);
        } else {
            res.render('secrets');
        }
    });

});

app.post('/login', loginLimiter, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: { $eq: username } }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render('secrets');
                }
            }
        }
    });
});


app.listen(3000, function () {
    console.log('Server started on port 3000.');
});