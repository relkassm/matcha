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
if (req.session.userid != 0)
    {
        navigator.geolocation.getCurrentPosition(pos => {
            connection.query("UPDATE user SET lat = ? , lng = ? WHERE id = ? ;", [pos.latitude, pos.longitude, req.session.userid], async(error) => {
                if (error) {
                    axios.get('http://ipinfo.io/json').then(data=>{
                    });
                }
            });    
        });
     
        var [row] = await connection.execute("SELECT * FROM user WHERE user.id = ?",[req.session.userid]);    
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
            res.render('profile', { title: 'Profile', row, tags, session});
        }  
    }
    else
        res.redirect('login');
});

router.post('/', async (req, res) => {
    var tags = global.temp;
    const errors = [];
    const id = req.session.userid;
    var [row] = await connection.execute("SELECT * FROM user WHERE user.id = ?",[req.session.userid]);
    var { firstname, lastname, username, email,age,gender,sexualPreference,bio,img0,img1,img2,img3,img4} = req.body;
    const [user_sess] = await connection.execute("SELECT username FROM user WHERE user.id = ?",[req.session.userid]);
    const [firstname_sess] = await connection.execute("SELECT firstname FROM user WHERE user.id = ?",[req.session.userid]);
    const [lastname_sess] = await connection.execute("SELECT lastname FROM user WHERE user.id = ?",[req.session.userid]);
    const [email_sess] = await connection.execute("SELECT email FROM user WHERE user.id = ?",[req.session.userid]);
    if (!firstname || !username || !lastname || !email || !age){
        errors.push({ msg: 'Please fill in all fields' });
    }
    else{
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
    }
    if(errors.length > 0){
        res.render('profile.ejs',{
            'errors': errors,
            'row': { firstname, lastname, username, email, age, bio, gender, sexualPreference, img0, img1, img2, img3, img4},
            tags
        });
    }else{
        if (req.body.update) {     
            await connection.query("UPDATE user SET email = ?,\
                                username = ?, \
                                lastname = ?, \
                                  firstname = ?, \
                                age = ?, \
                                gender = ?, \
                                preference = ?, \
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
                            const [test]= await connection.execute("SELECT a.id_user FROM (SELECT id_user FROM user_tag  WHERE id_tag= ?) a WHERE  a.id_user  = ? ",[tags[i].id,req.session.userid]);
                            if(!test)
                                var [tags_m] = await connection.execute("INSERT INTO user_tag (id_user, id_tag, time) VALUES (?, (SELECT tag.id FROM tag WHERE tag.label = ? ), now());", [req.session.userid, req.body.tag]);
                            break;
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