const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const session = require('express-session');

var connected;
var sort = 'Rating';
var order = 'Descending';
var filter = 'Distance';
var val0;
var val1;
var qr;
var qr_gender;
var qr_sort;
var qr_order;
var qr_filter;

var row;
var final_tags;

router.get('/', (req, res) =>  {
    if (req.session.userid != 0)
    {
        ss = req.session;
        connection.query("SELECT * FROM user WHERE id = ?;", ss.userid, (error, rowss) => {
            if (error) {
                console.log(error);
            } else {
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
                else if (sort == 'Rating')
                    qr_sort = ' ORDER BY rating';
                else {
                    qr_sort = '';
                    qr_order = '';
                }

                qr = "SELECT *, (SELECT ST_Distance_Sphere(point(".concat(connected.lng,",", connected.lat,"), \
                point(user.lng, user.lat))/1000) as distance \
                FROM user WHERE user.id != ", connected.id, " \
                AND user.id NOT IN (SELECT liked FROM matcha.like \
                WHERE liker = ", connected.id, ") ", " \
                AND user.id NOT IN (SELECT disliked FROM matcha.dislike \
                WHERE disliker = ", connected.id, ") ", qr_gender, qr_sort, qr_order, ";");
                connection.query(qr, (error, rows) => {
                    if (error)
                        console.log(error);
                    else if (rows.length) {
                        if (sort == 'Common Tags') {
                            var common_tags = '';
                            var common_tagsfinal = '';
                            var count_tags = 0;
                            var index;
                            for (let i = 0; i < rows.length; i++) {
                                qr = "SELECT id_tag, tag.label, COUNT(*) AS count \
                                                FROM user_tag INNER JOIN tag on tag.id = user_tag.id_tag \
                                                WHERE user_tag.id_user = ? \
                                                OR user_tag.id_user = ? \
                                                GROUP BY id_tag \
                                                HAVING count > 1 \
                                                ORDER BY count DESC;";
                                connection.query(qr, [ connected.id, rows[i].id ], (error, tags) => {
                                    if (error) {
                                        console.log(error);
                                    }
                                    if (tags.length >= count_tags) {
                                        common_tags = tags;
                                        count_tags = tags.length;
                                        index = i;
                                    }
                                    if (i == rows.length - 1)
                                    {
                                        row = rows[index];
                                        connection.query("SELECT label FROM tag \
                                            INNER JOIN user_tag \
                                            ON tag.id = user_tag.id_tag \
                                            WHERE id_user = ?;", row.id, (error, user_tags) => {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    final_tags = '';
                                                    for (let j = 0; j < user_tags.length; j++) {
                                                        final_tags = final_tags.concat('#', user_tags[j].label, " ");
                                                    }
                                                    common_tagsfinal = '';
                                                    for (let k = 0; k < common_tags.length; k++) {
                                                        common_tagsfinal = common_tagsfinal.concat('#', common_tags[k].label, " ");
                                                    }
                                                }
                                                res.render('match', { title: 'Match', row, session, sort, order, filter, final_tags, common_tagsfinal});
                                            });
                                    }
                                });
                            }    
                        }
                        else {
                            row = rows[0];
                            connection.query("SELECT label FROM tag \
                                                INNER JOIN user_tag \
                                                ON tag.id = user_tag.id_tag \
                                                WHERE id_user = ?;", row.id, (error, user_tags) => {
                                                    if (error) {
                                                        console.log(error);
                                                    } else {
                                                        final_tags = '';
                                                        for (let j = 0; j < user_tags.length; j++) {
                                                            final_tags = final_tags.concat('#', user_tags[j].label, " ");
                                                        }
                                                        res.render('match', { title: 'Match', row, session, sort, order, filter, final_tags});
                                                    }
                                                });
                        }
                    } else
                        res.redirect('405'); //No user found
                });
                


            }
        });

    }
    else
        res.redirect('login');
});

// SELECT id_tag, tag.label, COUNT(*) AS count FROM user_tag INNER JOIN tag on tag.id = user_tag.id_tag WHERE user_tag.id_user = 1 OR user_tag.id_user = 2 GROUP BY id_tag HAVING count > 1;

// SELECT username FROM user HAVING 

router.post('/', (req, res) => {
    if (req.body.update) {
        sort = req.body.sort;
        order = req.body.order;
        filter = req.body.filter;
        val0 = req.body.val0;
        val1 = req.body.val1;
        res.redirect('/match');
    }
    if (req.body.like) {
        connection.query("INSERT INTO matcha.like (liker, liked) VALUES(?, ?);", [connected.id, row.id], (error) => {
            if (error) {
                console.log(error);
            } else {
                connection.query("SELECT * FROM matcha.like WHERE liker = ? AND liked = ?;", [row.id, connected.id], (error, rowss) => {
                    if (error) {
                        console.log(error);
                    } else if (rowss.length) {
                        connection.query("INSERT INTO matcha.match (id_user0, id_user1, time) VALUES(?, ?, now());", [row.id, connected.id], (error) => {
                            if (error) {
                                console.log(error);
                            }
                        });
                    }
                });
            }
        });
        res.redirect('/match');
    }
    if (req.body.dislike) {
        connection.query("INSERT INTO matcha.dislike (disliker, disliked) VALUES(?, ?);", [connected.id, row.id], (error) => {
            if (error) {
                console.log(error);
            } else {
            }
        });
        res.redirect('/match');
    }
});

module.exports = router
