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
                    var [like] = await connection.execute("SELECT * FROM matcha.like WHERE liker = ? AND liked = ? ;",[req.session.userid, row.id]);
                    if (like.length) {
                        is_liked = 1;
                    }

                    var [is_match1] = await connection.execute("SELECT * FROM matcha.match WHERE id_user0 = ? AND id_user1 = ? ;",[req.session.userid, row.id]);
                    var [is_match2] = await connection.execute("SELECT * FROM matcha.match WHERE id_user1 = ? AND id_user0 = ? ;",[req.session.userid, row.id]);
                    var is_match = 0;
                    if (is_match1.length || is_match2.length){
                        is_match = 1;
                    }

                    var [messages] = await connection.execute("SELECT * FROM matcha.message WHERE (messager = ? AND messaged = ?) OR (messaged = ? AND messager = ?) ORDER BY time ASC;",[req.session.userid, row.id, req.session.userid, row.id]);


                    res.render('user', { title: 'User', row, tags, session, is_liked, is_match, messages});
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
        if (match.length)
            var [match_2] = await connection.execute("INSERT INTO matcha.match (id_user0, id_user1, time) VALUES(?, ?, now());", [req.body.id, connected.id]);
    }
    if (req.body.unlike) {
        var [unmatch_1] = await connection.execute("DELETE FROM matcha.match WHERE id_user0 = ? AND id_user1 = ? ;", [req.body.id, connected.id]);
        var [unmatch_2] = await connection.execute("DELETE FROM matcha.match WHERE id_user1 = ? AND id_user0 = ? ;", [req.body.id, connected.id]);
        var [unlike] = await  connection.execute("DELETE FROM matcha.like WHERE liker = ? AND liked = ? ;", [connected.id, req.body.id]);
        var [unrate] = await connection.execute("UPDATE user SET rating = rating - 50 WHERE id = ? ;", [req.body.id]);
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
    }
    res.redirect('/user/'.concat(req.body.id));
});

module.exports = router