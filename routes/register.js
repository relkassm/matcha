const express = require('express')
const router = express.Router()
const connection = require('../config/db')
const session = require('express-session')

router.get('/', (req, res) => {
    if (req.session.userid == 0)
        res.render('register', { title: 'Sign Up' });
    else
        res.redirect('/profile');
});

router.post('/', (req, res) => {
    const qr = "INSERT INTO user (email, username, lastname, firstname, password, online) VALUES ('".concat(req.body.email, "','", req.body.username, "','", req.body.lastname, "','", req.body.firstname, "','", req.body.password, "', 0);");
    connection.query(qr, (error) => {
        if (error) {
            console.log(error);
        } else {
            //pass confirmation
            //mail confirm function
            res.redirect('/login');
        }
    });
});

module.exports = router
