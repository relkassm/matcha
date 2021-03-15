const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const session = require('express-session');
const axios = require('axios');
const geolocation = require('geolocation');
const { Navigator } = require("node-navigator");
const navigator = new Navigator();
const Validator = require('./helpers/Validator');
const val = require("./helpers/checker")
global.temp = "";




router.get('/', async (req, res) => {
        console.log(req.baseUrl);
if (req.session.userid != 0)
    {
        var [row] = await connection.execute("SELECT * FROM user WHERE user.id = 2");
        if(row){
            row = row[0];
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
    }
    else
        res.redirect('/login');
});

router.post('/', async (req, res) => {

        res.redirect('/user');
});

module.exports = router