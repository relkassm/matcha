const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const session = require('express-session');


router.get('/', async (req, res) => {
if (req.session.userid != 0)
    {
        var [row] = await connection.execute("SELECT * FROM user WHERE user.id = ?",[req.session.userid]);    
        row = row[0];

        var [matches_0] = await connection.execute("SELECT matcha.match.*, id, firstname, lastname, img0, online FROM matcha.match \
                                                INNER JOIN matcha.user ON id_user1 = id \
                                                WHERE id_user0 = ? ;",[req.session.userid]);
        var [matches_1] = await connection.execute("SELECT matcha.match.*, id, firstname, lastname, img0, online FROM matcha.match \
                                                INNER JOIN matcha.user ON id_user0 = id \
                                                WHERE id_user1 = ? ;",[req.session.userid]);

        var [blocked] = await connection.execute("SELECT matcha.block.*, id, firstname, lastname FROM matcha.block INNER JOIN user ON blocked = id \
                                                WHERE blocker = ? ;", [req.session.userid]);

        var [liked] = await connection.execute("SELECT matcha.like.*, id, firstname, lastname FROM matcha.like INNER JOIN user ON liked = id \
                                                WHERE liker = ? ;", [req.session.userid]);

        var notif = 0;
        
        var [check_notif] = await connection.execute("SELECT * FROM notification WHERE notified = ? AND is_read = 0;", [req.session.userid]);
        if (check_notif.length) {
            notif = 1;
        }

        res.render('connections', { title: 'Connections', row, session, matches_0, matches_1, blocked, liked, notif});
    }
    else
        res.redirect('login');
});

router.post('/', async (req, res) => {
    
    if (req.body.unblock) {
        var [unblock] = await  connection.execute("DELETE FROM matcha.block WHERE blocker = ? AND blocked = ? ;", [req.session.userid, req.body.id]);
    }
    
    if (req.body.unlike) {
        
        var [is_match3] = await connection.execute("SELECT * FROM matcha.match WHERE id_user0 = ? AND id_user1 = ? ;",[req.session.userid, req.body.id]);
        var [is_match4] = await connection.execute("SELECT * FROM matcha.match WHERE id_user1 = ? AND id_user0 = ? ;",[req.session.userid, req.body.id]);
        if (is_match3.length || is_match4.length){
            var [unmatch_1] = await connection.execute("DELETE FROM matcha.match WHERE id_user0 = ? AND id_user1 = ? ;", [req.body.id, req.session.userid]);
            var [unmatch_2] = await connection.execute("DELETE FROM matcha.match WHERE id_user1 = ? AND id_user0 = ? ;", [req.body.id, req.session.userid]);
            var [notif_unmatch1] = await connection.execute("DELETE FROM matcha.notification WHERE notifier = ? AND notified = ? AND type = 5 ;", [req.session.userid, req.body.id]);
            var [notif_unmatch2] = await connection.execute("INSERT INTO matcha.notification (notifier, notified, type, time) VALUES(?, ?, 5, now());", [req.session.userid, req.body.id]);
        }
        var [unlike] = await  connection.execute("DELETE FROM matcha.like WHERE liker = ? AND liked = ? ;", [req.session.userid, req.body.id]);
        var [unrate] = await connection.execute("UPDATE user SET rating = rating - 100 WHERE id = ? ;", [req.body.id]);        
    }

    res.redirect('/connections');
});

module.exports = router