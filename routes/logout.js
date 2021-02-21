const express = require('express')
const router = express.Router()
const connection = require('../config/db')
const session = require('express-session')

router.get('/', (req, res) => {
    const qr = "UPDATE user SET online=0, last_con=now() WHERE id=".concat(req.session.userid, ";");
    connection.query(qr, (error) => {
        if (error) {
            console.log(error);
        } else {
            req.session.destroy();
            res.redirect('login');
        }
    });
});

module.exports = router
