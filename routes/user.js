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
            var [rowss] = await  connection.execute("SELECT * FROM user WHERE id = ?;", [req.session.userid]);
            connected = rowss[0];
            var [rows] = await connection.execute("SELECT *, (SELECT ST_Distance_Sphere(point( ? , ? ), \
                                                    point(user.lng, user.lat))/1000) as distance \
                                                    FROM user WHERE user.id = ? \
                                                    AND user.id NOT IN (SELECT blocked FROM matcha.block \
                                                    WHERE blocker = ? );", [connected.lng, connected.lat, id_param, connected.id]);
            if(rows.length){
                row = rows[0];
                var [user_int]= await connection.execute("SELECT tag.label FROM tag INNER JOIN user_tag ON tag.id=user_tag.id_tag WHERE user_tag.id_user = ? ORDER BY time asc",[req.session.userid]);
                if(user_int && user_int.length !== undefined)
                {
                    var tags = '';
                    for (var i = 0; i < user_int.length; i++) {
                        tags = tags.concat('#', user_int[i].label, " ");
                    }
                }
                global.temp = tags;
                res.render('user', { title: 'User', row, tags, session});
            }
            else
                res.redirect('/405');
        }
        else
            res.redirect('/profile');
    }
    else
        res.redirect('/login');
});

router.post('/', async (req, res) => {

        res.redirect('/user');
});

module.exports = router