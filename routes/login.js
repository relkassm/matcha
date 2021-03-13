const express = require('express')
const router = express.Router()
const connection = require('../config/db')

router.get('/', (req, res) => {
    if (req.session.userid == 0)
        res.render('login', { title: 'Sign In' });
    else
        res.redirect('/profile');
});

router.post('/', async (req, res) => {
    const qr = "SELECT * FROM user";
    const username = req.body.username;
    const password = req.body.password;
    const errors = [];
    var found = 0;
     connection.query(qr,  (error, rows) => {
        if (error) {
            console.log(error);
        } else {
            if (!username || !password)
                errors.push({ msg: 'Please fill in all fields' });
            rows.forEach(row => {
                if (req.body.username == row.username && req.body.password == row.password){
                    found = 1;
                    req.session.userid = row.id;
                    const qrr = "UPDATE user SET online=1 WHERE id=".concat(req.session.userid, ";");
                     connection.query(qrr,  (error) => {
                        if (error) {
                            console.log(error);
                        }
                        else
                        {
                            res.redirect('profile');
                        }
                    });
                }
            });
            }
            if(found === 0){
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

});
module.exports = router