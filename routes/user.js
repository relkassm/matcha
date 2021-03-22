const express = require('express');
const connection = require('../config/db');
const session = require('express-session');
const axios = require('axios');
const geolocation = require('geolocation');
const { Navigator } = require("node-navigator");
const navigator = new Navigator();
const Validator = require('./helpers/Validator');
const val = require("./helpers/checker")
global.temp = "";
const router = express.Router({ mergeParams: true });


router.get('/', async (req, res) => {
if (req.session.userid != 0)
    {
        const id_param = req.params.id;
        if (id_param != req.session.userid) {
            var [rowss] = await  connection.execute("SELECT * FROM user WHERE id = ? AND active = 1;", [req.session.userid]);
            if (rowss.length)
            {
                connected = rowss[0];
                var [rows] = await connection.execute("SELECT *, (SELECT ST_Distance_Sphere(point( ? , ? ), \
                                                        point(user.lng, user.lat))/1000) as distance \
                                                        FROM user WHERE active = 1 AND user.id = ? \
                                                        AND user.id NOT IN (SELECT blocked FROM matcha.block WHERE blocker = ?) \
                                                        AND user.id NOT IN (SELECT blocker FROM matcha.block WHERE blocked = ?);"
                                                        , [connected.lng, connected.lat, id_param, connected.id, connected.id]);
                if(rows.length) {
                    row = rows[0];
                    var [user_int] = await connection.execute("SELECT tag.label FROM tag INNER JOIN user_tag ON tag.id=user_tag.id_tag WHERE user_tag.id_user = ? ORDER BY time asc",[req.session.userid]);
                    if(user_int && user_int.length !== undefined)
                    {
                        var tags = '';
                        for (var i = 0; i < user_int.length; i++) {
                            tags = tags.concat('#', user_int[i].label, " ");
                        }
                    }
                    global.temp = tags;

                    var is_liked = 0;
                    var [like] = await connection.execute("SELECT * FROM matcha.like WHERE liker = ? AND liked = ? ;",[connected.id, row.id]);
                    if (like.length) {
                        is_liked = 1;
                    }

                    var [is_match1] = await connection.execute("SELECT * FROM matcha.match WHERE id_user0 = ? AND id_user1 = ? ;",[connected.id, row.id]);
                    var [is_match2] = await connection.execute("SELECT * FROM matcha.match WHERE id_user1 = ? AND id_user0 = ? ;",[connected.id, row.id]);
                    var is_match = 0;
                    if (is_match1.length || is_match2.length){
                        is_match = 1;
                    }

                    var [messages] = await connection.execute("SELECT * FROM matcha.message WHERE (messager = ? AND messaged = ?) OR (messaged = ? AND messager = ?) ORDER BY time ASC;",[req.session.userid, row.id, req.session.userid, row.id]);

                    var [visit] = await connection.execute("INSERT INTO matcha.visit (visiter, visited, time) VALUES (?, ?, now());",[connected.id, row.id]);
                    var [notif_visit1] = await connection.execute("DELETE FROM matcha.notification WHERE notifier = ? AND notified = ? AND type = 2 ;", [connected.id, row.id]);
                    var [notif_visit2] = await connection.execute("INSERT INTO matcha.notification (notifier, notified, type, time) VALUES(?, ?, 2, now());", [connected.id, row.id]);

                    res.render('user', { title: 'User', row, tags, is_liked, is_match, messages});
                }
                else
                    res.redirect('/405');
            }
            else
                res.redirect('/profile');
        }
        else
            res.redirect('/profile');
    }
    else
        res.redirect('/login');
});

router.post('/', async (req, res) => {
    if (req.body.like) {
        var [like_1] = await  connection.execute("INSERT INTO matcha.like (liker, liked) VALUES(?, ?);", [connected.id, req.body.id]);
        var [rate] = await connection.execute("UPDATE user SET rating = rating + 100 WHERE id = ? ;", [req.body.id]);
        var [match] = await connection.execute("SELECT * FROM matcha.like WHERE liker = ? AND liked = ?;", [req.body.id, connected.id]);
        if (match.length){
            var [match_2] = await connection.execute("INSERT INTO matcha.match (id_user0, id_user1, time) VALUES(?, ?, now());", [req.body.id, connected.id]);
            var [notif_match1] = await connection.execute("DELETE FROM matcha.notification WHERE notifier = ? AND notified = ? AND type = 4 ;", [connected.id, req.body.id]);
            var [notif_match2] = await connection.execute("INSERT INTO matcha.notification (notifier, notified, type, time) VALUES(?, ?, 4, now());", [connected.id, req.body.id]);
        } else{
            var [notif_like1] = await connection.execute("DELETE FROM matcha.notification WHERE notifier = ? AND notified = ? AND type = 1 ;", [connected.id, req.body.id]);
            var [notif_like2] = await connection.execute("INSERT INTO matcha.notification (notifier, notified, type, time) VALUES(?, ?, 1, now());", [connected.id, req.body.id]);
        }
    }


    if (req.body.unlike) {
        
        var [is_match3] = await connection.execute("SELECT * FROM matcha.match WHERE id_user0 = ? AND id_user1 = ? ;",[connected.id, req.body.id]);
        var [is_match4] = await connection.execute("SELECT * FROM matcha.match WHERE id_user1 = ? AND id_user0 = ? ;",[connected.id, req.body.id]);
        if (is_match3.length || is_match4.length){
            var [unmatch_1] = await connection.execute("DELETE FROM matcha.match WHERE id_user0 = ? AND id_user1 = ? ;", [req.body.id, connected.id]);
            var [unmatch_2] = await connection.execute("DELETE FROM matcha.match WHERE id_user1 = ? AND id_user0 = ? ;", [req.body.id, connected.id]);
            var [notif_unmatch1] = await connection.execute("DELETE FROM matcha.notification WHERE notifier = ? AND notified = ? AND type = 5 ;", [connected.id, req.body.id]);
            var [notif_unmatch2] = await connection.execute("INSERT INTO matcha.notification (notifier, notified, type, time) VALUES(?, ?, 5, now());", [connected.id, req.body.id]);
        }
        var [unlike] = await  connection.execute("DELETE FROM matcha.like WHERE liker = ? AND liked = ? ;", [connected.id, req.body.id]);
        var [unrate] = await connection.execute("UPDATE user SET rating = rating - 100 WHERE id = ? ;", [req.body.id]);        
    }


    if (req.body.block) {
        var [unmatch_1] = await connection.execute("DELETE FROM matcha.match WHERE id_user0 = ? AND id_user1 = ? ;", [req.body.id, connected.id]);
        var [unmatch_2] = await connection.execute("DELETE FROM matcha.match WHERE id_user1 = ? AND id_user0 = ? ;", [req.body.id, connected.id]);
        var [unlike] = await  connection.execute("DELETE FROM matcha.like WHERE liker = ? AND liked = ? ;", [connected.id, req.body.id]);
        var [block] = await connection.execute("INSERT INTO matcha.block (blocker, blocked) VALUES(?, ?);", [connected.id, req.body.id]);
    }


    if (req.body.report) {
    var [check_report] = await connection.execute("SELECT * FROM matcha.report WHERE reporter = ? AND reported = ? ;", [connected.id, req.body.id]);
        if (!check_report.length) {
            var [report] = await connection.execute("INSERT INTO matcha.report (reporter, reported) VALUES(?, ?);", [connected.id, req.body.id]);
            var [unrate] = await connection.execute("UPDATE user SET rating = rating - 100 WHERE id = ? ;", [req.body.id]);
        }
    }

    
    if (req.body.send) {
        var [message] = await connection.execute("INSERT INTO matcha.message (messager, messaged, message, time) VALUES(?, ?, ?, now());", [connected.id, req.body.id, req.body.message]);
        var [notif_message1] = await connection.execute("DELETE FROM matcha.notification WHERE notifier = ? AND notified = ? AND type = 3 ;", [connected.id, req.body.id]);
        var [notif_message2] = await connection.execute("INSERT INTO matcha.notification (notifier, notified, type, time) VALUES(?, ?, 3, now());", [connected.id, req.body.id]);

    }
    res.redirect('/user/'.concat(req.body.id));
});

module.exports = router