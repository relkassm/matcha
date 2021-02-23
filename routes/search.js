const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const session = require('express-session');

var connected;
var sort = 'Distance';
var order = 'Ascending';

var qr;
var qr_gender;
var qr_sort;
var qr_order;
var qr_distance;
var qr_fame;

var distance_range = 500;
var age_0 = 18;
var age_1 = 28;
var common_count = 0;
var fame = 0;

var row = [];
var rw = [];
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

                qr_distance = ' HAVING distance <= '.concat(distance_range);

                qr_age = ' AND age >= '.concat(age_0, ' AND age <= ', age_1);

                qr_fame = ' AND rating >= '.concat(fame);

                qr = "SELECT *, (SELECT ST_Distance_Sphere(point(".concat(connected.lng,",", connected.lat,"), \
                point(user.lng, user.lat))/1000) as distance \
                FROM user WHERE user.id != ", connected.id, " \
                AND user.id NOT IN (SELECT liked FROM matcha.like \
                WHERE liker = ", connected.id, ") ", " \
                AND user.id NOT IN (SELECT disliked FROM matcha.dislike \
                WHERE disliker = ", connected.id, ") ", qr_gender, qr_age, qr_fame, qr_distance, qr_sort, qr_order, ";");
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
                                    if (tags.length >= count_tags && tags.length >= common_count) {
                                        common_tags = tags;
                                        count_tags = tags.length;
                                        index = i;
                                    }
                                    if (i == rows.length - 1 && typeof(index) != 'undefined')
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
                                                res.render('search', { title: 'Search', row, sort, order, final_tags, common_tagsfinal, distance_range, age_0, age_1, common_count, fame});
                                            });
                                    } else if (i == rows.length - 1 && typeof(index) == 'undefined')
                                        res.render('search', { title: 'Search | No User Found', sort, order, distance_range, age_0, age_1, common_count, fame});
                                });
                            }    
                        }
                        else {
                            var index;
                            var rw = [];
                            var tag = [];

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
                                    if (tags.length >= common_count) {
                                        index = i;
                                        rw[rw.length] = rows[index];
                                        var id_row = rows[index].id;
                                        var row_lnt = rw.length - 1;
                                        var common_tags = tags;
                                        connection.query("SELECT label FROM tag \
                                            INNER JOIN user_tag \
                                            ON tag.id = user_tag.id_tag \
                                            WHERE id_user = ?;", id_row, (error, user_tags) => {
                                                if (error) 
                                                    console.log(error);
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
                                                console.log(i);
                                            });
                                    }
                                    if (i == rows.length - 1 && typeof(index) != 'undefined')
                                        res.render('search', { title: 'Search', rw, sort, order, distance_range, age_0, age_1, common_count, fame});
                                    else if (i == rows.length - 1 && typeof(index) == 'undefined')
                                        res.render('search', { title: 'Search | No User Found', sort, order, distance_range, age_0, age_1, common_count, fame});

                                });
                            }
                        }
                    } else {
                        res.render('search', { title: 'Search | No User Found', sort, order, distance_range, age_0, age_1, common_count, fame});
                    }
                });
            }
        });

    }
    else
        res.redirect('login');
});

router.post('/', (req, res) => {
    if (req.body.update) {
        sort = req.body.sort;
        order = req.body.order;
        distance_range = req.body.range;
        age_0 = req.body.age_0;
        age_1 = req.body.age_1;
        common_count = req.body.range_1;
        fame = req.body.range_2;

        res.redirect('/search');
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
        res.redirect('/search');
    }
    if (req.body.dislike) {
        connection.query("INSERT INTO matcha.dislike (disliker, disliked) VALUES(?, ?);", [connected.id, row.id], (error) => {
            if (error) {
                console.log(error);
            } else {
            }
        });
        res.redirect('/search');
    }
});

module.exports = router
