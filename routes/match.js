const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const session = require('express-session');
var sort = 'Geoographic Area';

const GeoPoint = require('geopoint');

router.get('/', (req, res) => {
    if (req.session.userid != 0)
    {
        ss = req.session;
        const qrr = "SELECT * FROM user WHERE id =".concat(ss.userid);
        connection.query(qrr, (error, rowss) => {
            if (error) {
                console.log(error);
            } else {
                connected = rowss[0];
            }
        });

        const qr = "SELECT * FROM user WHERE id !=".concat(ss.userid);
        connection.query(qr, (error, rows) => {
            if (error) {
                console.log(error);
            } else {
                if (rows){
                    if (sort == 'Geoographic Area'){
                        var connected_pos = new GeoPoint(connected.lat, connected.lng);
                        var match_pos;
                        var distance;
                        var min = 1000000000;
                        var index;
                        for (var i = 0; i < rows.length; i++) {
                            match_pos = new GeoPoint(rows[i].lat, rows[i].lng);
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
                        console.log(max);
                        res.render('match', { title: 'Match', row, session, sort});
                    }

                } else
                    res.redirect('404'); //No user found
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
});

module.exports = router
