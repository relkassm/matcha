const express = require('express')
const router = express.Router()
const connection = require('../config/db')
const val = require('./helpers/checker')
const Validator = require('./helpers/validator')


router.get('/', (req, res) => {
    if (req.session.userid == 0)
        res.render('register', { title: 'Sign Up' });
    else
        res.redirect('/profile');
});

router.post('/', async (req, res) => {
    const { firstname, lastname, username, email, password, password2 } = req.body;
    const errors = [];


    if (!firstname || !username || !lastname || !email || !password || !password2)
        errors.push({ msg: 'Please fill in all fields' });

    else {
        if (!Validator.checkUsername(username))
            errors.push({ msg: "Username should be between 6 And 30 And have only characters and _ - symbols" });
        
        if (await val.checkUsername2(username) === true)
            errors.push({ msg: 'Username taken by another user' });

        if (!Validator.checkName(firstname))
            errors.push({ msg: 'Firstname should be with only characters, and between 6 And 30' });

        if (!Validator.checkName(lastname))
            errors.push({ msg: 'Lastname should be with only characters, and between 6 And 30' });

        if (!Validator.checkEmail(email) || !Validator.checkLength(email, 100))
            errors.push({ msg: 'You need to set a valid email And less than 100 characters' });
        
        if (await val.checkEmail2(email) === true)
            errors.push({ msg: 'Email taken by another user' });

        if (!Validator.checkLength(password, 50) || password.length < 6)
            errors.push({ msg: 'Password should be between 6 and 50 characters' });

        if (!Validator.checkPassword(password))
            errors.push({ msg: 'Password should be at least 1 character Uppercase 1 character special 1 digit' });

        if (password !== password2)
            errors.push({ msg: 'Passwords do not match' });
    }


    if (errors.length > 0) {
        res.render('register.ejs', {
            errors,
            firstname,
            lastname,
            username,
            email,
            password,
            password2
        });
    }
    else{
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
    }
});

module.exports = router
