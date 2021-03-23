const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const session = require('express-session');
const util = require('util');
const { cpuUsage } = require('process');

var connected;
var sort = 'Distance';
var order = 'Ascending';

var qr;
var qr_gender;
var qr_sort;
var qr_order;
var qr_distance;
var qr_fame;

var distance_range = 20000;
var age_0 = 18;
var age_1 = 28;
var common_count = 0;
var fame = 0;

var row = [];
var rw = [];
var final_tags;

router.get('/',async (req, res) =>  {
    if (req.session.userid != 0)
    {
        ss = req.session;
        var [rowss] = await  connection.execute("SELECT * FROM user WHERE id = ? AND active = 1;", [ss.userid]);

        var notif = 0;
        
        var [check_notif] = await connection.execute("SELECT * FROM notification WHERE notified = ? AND is_read = 0;", [req.session.userid]);
        if (check_notif.length) {
            notif = 1;
        }

        if (rowss.length) {
            connected = rowss[0];
            if (connected.gender == 'Man') {
                if (connected.preference == 'Heterosexual') {
                    qr_gender = " AND (gender = 'Woman' AND (preference='Heterosexual' OR preference='Bisexual'))"
                } else if (connected.preference == 'Homosexual') {
                    qr_gender = " AND (gender = 'Man' AND (preference='Homosexual' OR preference='Bisexual'))"
                } else {
                    qr_gender = " AND ((gender = 'Man' AND (preference='Homosexual' OR preference='Bisexual')) \
                            OR (gender = 'Woman' AND (preference='Heterosexual' OR preference='Bisexual')))"
                }
            } else {
                if (connected.preference == 'Heterosexual') {
                    qr_gender = " AND (gender = 'Man' AND (preference='Heterosexual' OR preference='Bisexual'))"
                } else if (connected.preference == 'Homosexual') {
                    qr_gender = " AND (gender = 'Woman' AND (preference='Homosexual' OR preference='Bisexual'))"
                } else {
                    qr_gender = " AND ((gender = 'Woman' AND (preference='Homosexual' OR preference='Bisexual')) \
                            OR (gender = 'Man' AND (preference='Heterosexual' OR preference='Bisexual')))"
                }
            }
            
            if (order == 'Ascending')
                qr_order = ' ASC';
            else
                qr_order = ' DESC';

            if (sort == 'Distance')
                qr_sort = ' ORDER BY distance';
            else if (sort == 'Age')
                qr_sort = ' ORDER BY age';
            else if (sort == 'Fame Rating')
                qr_sort = ' ORDER BY rating';
            else {
                qr_sort = '';
                qr_order = '';
            }

            qr_distance = ' HAVING distance <= '.concat(distance_range);

            qr_age = ' AND age >= '.concat(age_0, ' AND age <= ', age_1);

            qr_fame = ' AND rating >= '.concat(fame);

            qr = "SELECT *, (SELECT ST_Distance_Sphere(point(".concat(connected.lng,",", connected.lat,"), \
            point(user.lng, user.lat))/1000) as distance \
            FROM user WHERE active = 1 AND user.id != ", connected.id, " \
            AND user.id NOT IN (SELECT liked FROM matcha.like \
            WHERE liker = ", connected.id, ") ", " \
            AND user.id NOT IN (SELECT blocked FROM matcha.block WHERE blocker = ", connected.id, ") \
            AND user.id NOT IN (SELECT blocker FROM matcha.block WHERE blocked = ", connected.id, ") \
            ", qr_gender, qr_age, qr_fame, qr_distance, qr_sort, qr_order, ";");
            var [rows] = await connection.execute(qr);
            if (rows.length) {
                    if (sort == 'Common Tags') {
                        var index;
                        var rw = [];
                        var tag = [];
                        var user_tags;

                        for (let i = 0; i < rows.length; i++) {
                            qr = "SELECT id_tag, tag.label, COUNT(*) AS count \
                                            FROM user_tag INNER JOIN tag on tag.id = user_tag.id_tag \
                                            WHERE user_tag.id_user = ? \
                                            OR user_tag.id_user = ? \
                                            GROUP BY id_tag \
                                            HAVING count > 1 \
                                            ORDER BY count DESC;";
                            var[tags] = await connection.execute(qr,[ connected.id, rows[i].id ]);
                            if (tags.length >= common_count) {
                                index = i;
                                rw[rw.length] = rows[index];
                                var id_row = rows[index].id;
                                var row_lnt = rw.length - 1;
                                var common_tags = tags;
                                var [user_tags] = await connection.execute("SELECT label FROM tag \
                                INNER JOIN user_tag \
                                ON tag.id = user_tag.id_tag \
                                WHERE id_user = ?;", [id_row]);
                                var final_tags = '';
                                var common_tagsfinal = '';
                                for (let j = 0; j < user_tags.length; j++) {
                                    final_tags = final_tags.concat('#', user_tags[j].label, " ");
                                }
                                for (let k = 0; k < common_tags.length; k++) {
                                    common_tagsfinal = common_tagsfinal.concat('#', common_tags[k].label, " ");
                                }
                                rw[row_lnt].tags = final_tags;
                                rw[row_lnt].common = common_tagsfinal;
                                rw[row_lnt].count = common_tags.length;;
                            }
                                function render0() {
                                    for (var i = 0; i < rw.length; i++) {
                                        for (var j = 0; j < rw.length - 1; j++) {
                                            if (rw[j].count < rw[j + 1].count) {
                                                var swap = rw[j];
                                                rw[j] = rw[j + 1];
                                                rw [j + 1] = swap
                                            }
                                        }
                                    }
                                    res.render('match', { title: 'Match', rw, sort, order, distance_range, age_0, age_1, common_count, fame, notif});
                                }
                                if (i == rows.length - 1 && typeof(index) != 'undefined')
                                    setTimeout(render0, 100);
                                if (i == rows.length - 1 && typeof(index) == 'undefined')
                                        res.render('match', { title: 'Match | No User Found', sort, order, distance_range, age_0, age_1, common_count, fame, notif});
                        }
                    }
                    else {
                        var index;
                        var rw = [];
                        var tag = [];
                        var user_tags;

                        for (let i = 0; i < rows.length; i++) {
                            qr = "SELECT id_tag, tag.label, COUNT(*) AS count \
                                            FROM user_tag INNER JOIN tag on tag.id = user_tag.id_tag \
                                            WHERE user_tag.id_user = ? \
                                            OR user_tag.id_user = ? \
                                            GROUP BY id_tag \
                                            HAVING count > 1 \
                                            ORDER BY count DESC;";
                            var [tags] = await connection.execute(qr,[ connected.id, rows[i].id ]);
                            if (tags.length >= common_count) {
                                index = i;
                                rw[rw.length] = rows[index];
                                var id_row = rows[index].id;
                                var row_lnt = rw.length - 1;
                                var common_tags = tags;
                                var[user_tags] = await connection.execute("SELECT label FROM tag \
                                INNER JOIN user_tag \
                                ON tag.id = user_tag.id_tag \
                                WHERE id_user = ?;", [id_row]);
                                var final_tags = '';
                                var common_tagsfinal = '';
                                for (let j = 0; j < user_tags.length; j++) {
                                    final_tags = final_tags.concat('#', user_tags[j].label, " ");
                                }
                                for (let k = 0; k < common_tags.length; k++) {
                                    common_tagsfinal = common_tagsfinal.concat('#', common_tags[k].label, " ");
                                }
                                rw[row_lnt].tags = final_tags;
                                rw[row_lnt].common = common_tagsfinal;
                            }
                                function render0() {
                                    res.render('match', { title: 'Match', rw, sort, order, distance_range, age_0, age_1, common_count, fame, notif});
                                }
                                if (i == rows.length - 1 && typeof(index) != 'undefined')
                                    setTimeout(render0, 50);
                                if (i == rows.length - 1 && typeof(index) == 'undefined')
                                    res.render('match', { title: 'Match | No User Found', sort, order, distance_range, age_0, age_1, common_count, fame, notif});
                        }
                    }
                } else {
                    res.render('match', { title: 'Match | No User Found', sort, order, distance_range, age_0, age_1, common_count, fame, notif});
                }
        }
        else
            res.redirect('profile');
    }
    else
        res.redirect('login');
});

router.post('/', async (req, res) => {
    if (req.body.update) {
        sort = req.body.sort;
        order = req.body.order;
        distance_range = req.body.range;
        age_0 = req.body.age_0;
        age_1 = req.body.age_1;
        common_count = req.body.range_1;
        fame = req.body.range_2;
    }
    if (req.body.like) {
        var [like_1] = await  connection.execute("INSERT INTO matcha.like (liker, liked) VALUES(?, ?);", [connected.id, req.body.id]);
        var [rate] = await connection.execute("UPDATE user SET rating = rating + 100 WHERE id = ? ;", [req.body.id]);
        var [match] = await connection.execute("SELECT * FROM matcha.like WHERE liker = ? AND liked = ?;", [req.body.id, connected.id]);
        if (match.length) {
            var [match_2] = await connection.execute("INSERT INTO matcha.match (id_user0, id_user1, time) VALUES(?, ?, now());", [req.body.id, connected.id]);
            var [notif_match1] = await connection.execute("DELETE FROM matcha.notification WHERE notifier = ? AND notified = ? AND type = 4 ;", [connected.id, req.body.id]);
            var [notif_match2] = await connection.execute("INSERT INTO matcha.notification (notifier, notified, type, time) VALUES(?, ?, 4, now());", [connected.id, req.body.id]);
        } else {
            var [notif_like1] = await connection.execute("DELETE FROM matcha.notification WHERE notifier = ? AND notified = ? AND type = 1 ;", [connected.id, req.body.id]);
            var [notif_like2] = await connection.execute("INSERT INTO matcha.notification (notifier, notified, type, time) VALUES(?, ?, 1, now());", [connected.id, req.body.id]);
        }
    }
    if (req.body.block) {
        var [block] = await connection.execute("INSERT INTO matcha.block (blocker, blocked) VALUES(?, ?);", [connected.id, req.body.id]);
    }
    if (req.body.report) {
        var [check_report] = await connection.execute("SELECT * FROM matcha.report WHERE reporter = ? AND reported = ? ;", [connected.id, req.body.id]);
        if (!check_report.length) {
            var [report] = await connection.execute("INSERT INTO matcha.report (reporter, reported) VALUES(?, ?);", [connected.id, req.body.id]);
            var [unrate] = await connection.execute("UPDATE user SET rating = rating - 100 WHERE id = ? ;", [req.body.id]);
        }
    }
    res.redirect('/match');
});

module.exports = router
