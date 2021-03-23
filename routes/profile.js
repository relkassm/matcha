const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const axios = require('axios');
const Validator = require('./helpers/Validator');
const val = require("./helpers/checker")
var wc = require('which-country');
var countries = require("i18n-iso-countries");
var uniqid = require('uniqid');
const multer = require('multer');
global.temp = "";



router.get('/', async (req, res) => {
if (req.session.userid != 0)
    {
        var [row] = await connection.execute("SELECT * FROM user WHERE user.id = ?",[req.session.userid]);    
        row = row[0];
        var [user_int]= await connection.execute("SELECT tag.label FROM tag INNER JOIN user_tag ON tag.id=user_tag.id_tag WHERE user_tag.id_user = ? ORDER BY time asc",[req.session.userid]);
        if (user_int && user_int.length !== undefined)
        {
            var tags = '';
            for (var i = 0; i < user_int.length; i++) {
                tags = tags.concat('#', user_int[i].label, " ");
            }
        }
        global.temp = tags;
        if ( row.firstname && row.lastname && row.gender && row.preference && row.bio && row.age && row.country && row.img0 && tags)
            var [active_1] = await connection.execute("UPDATE user SET active = 1 WHERE id = ? ;", [req.session.userid]);
        else
            var [active_0] = await connection.execute("UPDATE user SET active = 0 WHERE id = ? ;", [req.session.userid]);

        var notif = 0;
        
        var [check_notif] = await connection.execute("SELECT * FROM notification WHERE notified = ? AND is_read = 0;", [req.session.userid]);
        if (check_notif.length) {
            notif = 1;
        }

        res.render('profile', { title: 'Profile', row, tags, notif});

    }
    else
        res.redirect('login');
});

router.post('/', async (req, res) => {
    var tags = global.temp;
    const errors = [];
    const id = req.session.userid;
    var rating;
    var [row] = await connection.execute("SELECT * FROM user WHERE user.id = ?",[req.session.userid]);
    var { firstname, lastname, username, email,age,gender,sexualPreference,bio,img0,img1,img2,img3,img4} = req.body;
    const [user_sess] = await connection.execute("SELECT username FROM user WHERE user.id = ?",[req.session.userid]);
    const [user_lat] = await connection.execute("SELECT lat FROM user WHERE user.id = ?",[req.session.userid]);
    const [user_lng] = await connection.execute("SELECT lng FROM user WHERE user.id = ?",[req.session.userid]);
    const [firstname_sess] = await connection.execute("SELECT firstname FROM user WHERE user.id = ?",[req.session.userid]);
    const [lastname_sess] = await connection.execute("SELECT lastname FROM user WHERE user.id = ?",[req.session.userid]);
    const [email_sess] = await connection.execute("SELECT email FROM user WHERE user.id = ?",[req.session.userid]);
    const [rating_sess] = await connection.execute("SELECT rating FROM user WHERE user.id = ?",[req.session.userid]);

    
   
    if (!firstname || !username || !lastname || !email || !age) {
        errors.push({ msg: 'Please fill in all fields' });
    }
    else {
        if (!Validator.checkUsername(username)){
            errors.push({ msg: "Username should be between 6 And 30 And have only characters and _ - symbols" });
            username =  user_sess[0].username;
        }   
 
        if(user_sess[0]){
            if (await val.checkUsername2(username) && username != user_sess[0].username){
                errors.push({ msg: "Username Already in use"});
                username =  user_sess[0].username;
            }
        }

        if (!Validator.checkName(firstname)){
            if(firstname_sess[0]){
                firstname =   firstname_sess[0].firstname;
                errors.push({ msg: 'Firstname should be with only characters, and between 6 And 30' });
            }
        }

        if (!Validator.checkName(lastname)){
            if(lastname_sess[0])
                lastname =   lastname_sess[0].lastname;
            errors.push({ msg: 'Lastname should be with only characters, and between 6 And 30' });
        }

        if (!Validator.checkEmail(email) || !Validator.checkLength(email, 100)){
            if(email_sess[0])
                email =   email_sess[0].email;
            errors.push({ msg: 'You need to set a valid email And less than 100 characters' });
        }
        if(email_sess[0]){
            if(await val.checkEmail2(email) && email !== email_sess[0].email){
                email =   email_sess[0].email;
                errors.push({ msg: 'Email already in use' });
            }
        }
        if(rating_sess[0])
            rating  = rating_sess[0].rating;
    }
    if (errors.length > 0) {
        rating  = rating_sess[0].rating;
        res.render('profile.ejs',{
            'errors': errors,
            'row': { firstname, lastname, username, email, age, bio,rating, gender, sexualPreference, img0, img1, img2, img3, img4},
            tags
        });
    } else {
        if (req.body.update) {
                //console.log (req.file.filename)
                /*res.render('profile.ejs', {
                 'row':{},
                  file: `uploads/${req.file.filename}`
                });*/
            var lat = req.body.lat;
            var lng = req.body.lng;
            var loc;
           if((!user_lat[0].lat || !user_lng[0].lng) && (lat == "" || lng == ""))
            {
                await axios.get('http://ipinfo.io/json').then(resp => {
                    const arr = resp.data.loc.split(",");
                     loc = {lat: parseFloat(arr[0]), lng: parseFloat(arr[1])}
                })
                lat = loc.lat;
                lng = loc.lng;
            }
            else if (lat == "" || lng == "" || wc([lng, lat]) == null)
            {
                lat = user_lat[0].lat;
                lng = user_lng[0].lng;
            }
            var country = countries.getName(wc([lng, lat]), "en", {select: "official"});
            //console.log(req.body.img0);
            await connection.query("UPDATE user SET email = ?,\
                                username = ?, \
                                lastname = ?, \
                                firstname = ?, \
                                age = ?, \
                                gender = ?, \
                                preference = ?, \
                                lat = ?,\
                                lng = ?,\
                                country = ?,\
                                bio = ?, \
                                img0 = ?, \
                                img1 = ?, \
                                img2 = ?, \
                                img3 = ?, \
                                img4 = ? \
                                WHERE id = ?;",
                                [req.body.email,
                                req.body.username,
                                req.body.lastname,
                                req.body.firstname,
                                req.body.age,
                                req.body.gender,
                                req.body.preference,
                                lat,
                                lng,
                                country,
                                req.body.bio,
                                req.body.img0,
                                req.body.img1,
                                req.body.img2,
                                req.body.img3,
                                req.body.img4,
                                req.session.userid], (error) => {
                    if (error) {
                        console.log(error);
                    }
                });
            }
        if (req.body.add_tag) {
                const [tags] = await connection.execute("SELECT * FROM tag;");
                var flag = 0;
                if(tags){
                    for (var i = 0; i < tags.length; i++) {          
                        if (req.body.tag == tags[i].label) {
                            flag = 1;
                            const [test] = await connection.execute("SELECT * FROM user_tag WHERE id_user = ? AND id_tag = ? ;",[req.session.userid, tags[i].id]);
                            if(!test.length){
                                var [tags_m] = await connection.execute("INSERT INTO user_tag (id_user, id_tag, time) VALUES (?, (SELECT tag.id FROM tag WHERE tag.label = ? ), now());", [req.session.userid, req.body.tag]);
                                break;
                            }
                        }
                    }
                if (flag == 0 && req.body.tag) {
                    const [tag_t] = await connection.execute("INSERT INTO tag (label) VALUES (?);", [req.body.tag]);
                    const[tag_w]= await connection.execute("INSERT INTO user_tag (id_user, id_tag, time) VALUES (?, (SELECT tag.id FROM tag WHERE tag.label = ? ), now());", [req.session.userid, req.body.tag]);
                }  
            }
        }
        if (req.body.remove_tag) {
            connection.query("DELETE FROM user_tag WHERE id_user = ? ORDER BY time DESC LIMIT 1;", req.session.userid, (error) => {
                if (error) {
                    console.log(error);
                }
            });
    
        }
        
        if (req.body.reset_tag) {
            connection.query("DELETE FROM user_tag where id_user = ?;", req.session.userid, (error) => {
                if (error) {
                    console.log(error);
                }
            });
        }

        res.redirect('/profile');
    }
});

module.exports = router