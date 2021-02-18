const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const session = require('express-session');
var sort = 'Geoographic Area';

const GeoPoint = require('geopoint');
var connected;
var qr;
var qr2;
var gender;
var preference;

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
                        qr2 = " AND gender = 'Woman' AND (preference='Heterosexual' OR preference='Bisexual');"
                    } else if (connected.preference == 'Homosexual') {
                        qr2 = " AND gender = 'Man' AND (preference='Homosexual' OR preference='Bisexual');"
                    } else {
                        qr2 = " AND (gender = 'Man' AND (preference='Homosexual' OR preference='Bisexual')) \
                                OR (gender = 'Woman' AND (preference='Heterosexual' OR preference='Bisexual'));"
                    }
                } else {
                    if (connected.preference == 'Heterosexual') {
                        qr2 = " AND gender = 'Man' AND (preference='Heterosexual' OR preference='Bisexual');"
                    } else if (connected.preference == 'Homosexual') {
                        qr2 = " AND gender = 'Woman' AND (preference='Homosexual' OR preference='Bisexual');"
                    } else {
                        qr2 = " AND (gender = 'Woman' AND (preference='Homosexual' OR preference='Bisexual')) \
                                OR (gender = 'Man' AND (preference='Heterosexual' OR preference='Bisexual'));"
                    }
                }
                qr = "SELECT * FROM user WHERE id !=".concat(ss.userid, qr2);
                connection.query(qr, (error, rows) => {
                    if (error) {
                        console.log(error);
                    } else {
                        if (rows.length){
                            if (sort == 'Geoographic Area'){
                                var connected_pos = new GeoPoint(connected.lat, connected.lng);
                                var match_pos;
                                var distance;
                                var min = 1000000000;
                                var index;
                                for (var i = 0; i < rows.length; i++) {
                                    match_pos = new GeoPoint(rows[i].lat, rows[i].lng);
                                    if (connected.lat == rows[i].lat && connected.lng == rows[i].lng)
                                        distance = 0;
                                    else
                                        distance = connected_pos.distanceTo(match_pos, true);
                                    if (distance < min){
                                        min = distance;
                                        index = i;
                                    }
                                }
                                min = min.toFixed(2);
                                if (min < 1)
                                    min = 'Less than a ';
                                row = rows[index];
                                row.distance = min;
                                res.render('match', { title: 'Match', row, session, sort});
                            } 
                            else if (sort == 'Fame Rating'){
                                var connected_pos = new GeoPoint(connected.lat, connected.lng);
                                var match_pos;
                                var distance;
                                var max = -1;
                                var dis = 0;
                                var index;
                                for (var i = 0; i < rows.length; i++) {
                                    match_pos = new GeoPoint(rows[i].lat, rows[i].lng);
                                    if (connected.lat == rows[i].lat && connected.lng == rows[i].lng)
                                        distance = 0;
                                    else
                                        distance = connected_pos.distanceTo(match_pos, true);
                                    if (rows[i].rating > max){
                                        max = rows[i].rating;
                                        index = i;
                                        dis = distance;
                                    }
                                }
                                dis = dis.toFixed(2);
                                if (dis < 1)
                                    dis = 'Less than a ';
                                row = rows[index];
                                row.distance = dis;
                                res.render('match', { title: 'Match', row, session, sort});
                            }

                        } else
                            res.redirect('404'); //No user found
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
        res.redirect('/match');
    }
    if (req.body.like) {
        console.log(connected.id);
        console.log(row.id);
        qr = "INSERT INTO matcha.like (liker, liked) VALUES(".concat(connected.id, ", ", row.id, ");");
        console.log(qr);
        connection.query(qr, (error, rowss) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Halfway there');
            }
        });
        res.redirect('/match');
    }
    if (req.body.dislike) {
        res.redirect('/match');
    }
});

module.exports = router
