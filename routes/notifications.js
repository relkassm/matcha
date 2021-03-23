const express = require('express');
const connection = require('../config/db');
const session = require('express-session');
const router = express.Router();

router.get('/', async (req, res) => {
if (req.session.userid != 0)
    {
        var [rows] = await  connection.execute("SELECT * FROM user WHERE id = ? AND active = 1;", [req.session.userid]);
        if (rows.length)
        {
            connected = rows[0];
            var [notif] = await  connection.execute("SELECT notification.*, id, lastname, firstname FROM notification \
                                                    INNER JOIN user ON notifier = id \
                                                    WHERE notified = ? ORDER BY time DESC", [connected.id]);

            var [read_notif] = await connection.execute("UPDATE notification SET is_read = 1 WHERE notified = ? ;", [connected.id]);

            res.render('notifications', { title: 'notifications', notif});
        }
        else
            res.render('notifications', { title: 'notifications'});
    }
    else
        res.redirect('/login');
});

router.post('/', async (req, res) => {

});

module.exports = router