const connection = require("../config/db");
const express = require('express');
const router = express.Router()
const val = require('./helpers/checker');
const bcrypt = require('bcryptjs');
const Validator = require('./helpers/validator');
const mailer = require('./helpers/Mailer');


router.get('/', (req, res) => {
    if (req.session.userid == 0)
        res.render('forgot_pass', { title: 'Pass Reset' });
    else
        res.redirect('/profile');
});

router.post('/', async (req, res) => {
    if(req.session.userid != 0 ){
        res.redirect('./profile')
        res.end();
    }
    else{
        const email = req.body.email;
        const errors = [];
    
    
        if (!email)
            errors.push({ msg: 'Please fill in all fields' });
    
        else if(!Validator.checkEmail(email) || !Validator.checkLength(email, 100))
                errors.push({ msg: 'You need to set a valid email And less than 100 characters' });
        else{
            const salt = bcrypt.genSaltSync(10);
            const token = bcrypt.hashSync(email, salt);
            const[user] = await connection.execute("SELECT email FROM user where email = ?",[email]);
            await mailer.mailer(email, 'validate your account <a target="_blank" href="http://localhost:1337/update_pass2?token='+token+'&email='+email+'">validate</a>', "matcha");
        }
    }
})

module.exports = router;