const express = require('express')
const router = express.Router()
const connection = require('../config/db')
const bcrypt = require('bcryptjs');

router.get('/', (req, res) => {
    if (req.session.userid == 0)
        res.render('login', { title: 'Sign In' });
    else
        res.redirect('/profile');
});

router.post('/', async (req, res) => {
    const qr = "SELECT * FROM user where username = ?";
    const username = req.body.username;
    const password = req.body.password;
    const errors = [];
    if (!username || !password)
        errors.push({ msg: 'Please fill in all fields' });
    const [user] = await connection.execute(qr,[req.body.username]);
    if (user.length){
        const passwrd  = await bcrypt.compare(req.body.password,user[0].password);
        if (passwrd){
            if(user[0].confirmed == 1){
                req.session.userid = user[0].id;
                const qrr = "UPDATE user SET online=1 WHERE id=?";
                const [up] = await connection.execute(qrr,[req.session.userid]);
                res.redirect('profile');
            }
            else{
                errors.push({ msg: ' Account Not verified' });
                if (errors.length > 0) {
                            res.render('login.ejs', {
                                errors,
                                username,
                                password
                            });
            }
        }
    } 
        else{ 
            errors.push({ msg: 'Username or Password Incorrect' });
            if (errors.length > 0) {
                        res.render('login.ejs', {
                            errors,
                            username,
                            password
                        });
                }
        }
    }
    else {
        errors.push({ msg: 'Username or Password Incorrect' });
        if (errors.length > 0) {
                    res.render('login.ejs', {
                        errors,
                        username,
                        password
                    });
             }
    }
});
module.exports = router