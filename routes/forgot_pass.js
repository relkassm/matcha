const connection = require("../config/db");
const express = require('express');
const router = express.Router()
const val = require('./helpers/checker');
const bcrypt = require('bcryptjs');
const Validator = require('./helpers/validator');
const mailer = require('./helpers/Mailer');
const uniqid = require('uniqid');


router.get('/', async (req, res) => {

    console.log(req.session.userid);
    if (req.session.userid == 0){
            res.render('forgot_pass', { title: 'forgot pass' });
            res.end();
        }
    else
    {
        console.log("test");
        res.redirect('/profile');
        res.end();
    }
});

router.post('/', async (req, res) => {
    const email = req.body.email;
    const errors = [];
    if(req.session.userid != 0 ){
        res.redirect('/profile')
        res.end();
    }
    else{
        if (!email)
            errors.push({ msg: 'Please fill in all fields' });
    
        else if(!Validator.checkEmail(email) || !Validator.checkLength(email, 100))
                errors.push({ msg: 'You need to set a valid email And less than 100 characters' });
        else if(errors.length > 0)
        {
            console.log("here");
            res.render('forgot_pass.ejs', {
                errors,
                email
            });
        }
        else{
            const salt = bcrypt.genSaltSync(10);
            const token = bcrypt.hashSync(email, salt);
            const[user] = await connection.execute("SELECT email FROM user where email = ?",[email]);
            if(user[0])
            {
                var newPassword = uniqid();
                newPassword = "Xpz*" + newPassword;
                mailer.mailer(email, 'Your new  password ' + newPassword, "New password");
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(newPassword, salt);
                const[upd] = await connection.execute("UPDATE user SET password = ? WHERE email = ?",[hashedPassword,email]);
                res.redirect('/login');
            }
            else{
                errors.push({ msg: 'No accounts created by that email' });
                console.log(errors);
                res.render('forgot_pass.ejs', {
                    errors,
                    email
                });
            }
        }
    }
})

module.exports = router;