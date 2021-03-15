const connection = require("../config/db");
const express = require('express');
const router = express.Router()
const val = require('./helpers/checker');
const bcrypt = require('bcryptjs');
const Validator = require('./helpers/validator');


router.get('/', (req, res) => {
    if (req.session.userid != 0)
        res.render('update_pass', { title: 'Sign In' });
    else
        res.redirect('/login');
});

router.post('/', async (req, res) => {
    const {password,password2} = req.body;
    var errors = [];
    if (req.session.userid == 0){
        res.redirect('/login');
        res.end();
    }
    if (typeof password === "undefined" || typeof password2 === "undefined" || typeof password !== "string" || typeof password2 !== "string")
        errors.push('Please Fill all fields');
    else{
        if (!Validator.checkLength(password, 50) || password.length < 6)
            errors.push({ msg: 'Password should be between 6 and 50 characters' });
        if (!Validator.checkPassword(password))
            errors.push({ msg: 'Password should be at least 1 character Uppercase 1 character special 1 digit' });
        if (password !== password2)
            errors.push({ msg: 'Passwords do not match' });
    }
    if (errors.length > 0)
    {
        res.render('update_pass.ejs', {
            errors,
            password,
            password2
        });
    }
    else{
        const salt = bcrypt.genSaltSync(10);
        const pass = bcrypt.hashSync(password, salt);
        const[upd] = await connection.execute("UPDATE user SET password = ? WHERE user.id = ?",[pass,req.session.userid]);
        console.log(req.session.userid);
        if(upd.affectedRows)
        {
            res.redirect('/profile');
            res.end();
        }
        else{
            errors.push({ msg: 'something Went wrong' })
            res.render('update_pass.ejs', {
                errors,
                password,
                password2
            });
        }
    }
})

module.exports = router;