const express = require('express')
const router = express.Router()
const connection = require('../config/db')
const session = require('express-session')

router.get('/', (req, res) => {
    if (req.session.userid == 0)
        res.render('login', { title: 'Sign In' });
    else
        res.redirect('/profile');
});

router.post('/', (req, res) => {
    const qr = "SELECT * FROM user";
    connection.query(qr, (error, rows) => {
        if (error) {
            console.log(error);
        } else {
            rows.forEach(row => {
                if (req.body.username == row.username && req.body.password == row.password){
                    req.session.userid = row.id;
                    const qrr = "UPDATE user SET online=1 WHERE id=".concat(req.session.userid, ";");
                    connection.query(qrr, (error) => {
                        if (error) {
                            console.log(error);
                        }
                        else
                            res.redirect('profile');
                    });
                }
            });
        }
    });
});

module.exports = router