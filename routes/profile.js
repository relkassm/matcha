const express = require('express');
const router = express.Router();
const connection = require('../config/db');
const session = require('express-session');

const geolocation = require('geolocation');
const { Navigator } = require("node-navigator");
const navigator = new Navigator();




router.get('/', (req, res) => {
    if (req.session.userid != 0)
    {
        navigator.geolocation.getCurrentPosition(pos => {
            const qrr = "UPDATE user SET lat=".concat(pos.latitude,", lng=", pos.longitude," WHERE id=", req.session.userid, ";");
            connection.query(qrr, (error) => {
                if (error) {
                    console.log(error);
                }
            });    
        });

        
        const qr = "SELECT * FROM user WHERE user.id = ".concat(req.session.userid);
        connection.query(qr, (error, rows) => {
            if (error) {
                console.log(error);
            } else {
                var row = rows[0];
                res.render('profile', { title: 'Profile', row, session});
            }
        });
    }
    else
        res.redirect('login');
});

router.post('/', (req, res) => {
    if (req.body.update) {
        const qr = "UPDATE user SET email='".concat(req.body.email,"', \
                    username='",req.body.username,"', \
                    lastname='", req.body.lastname,"', \
                    firstname='", req.body.firstname,"', \
                    password='", req.body.password,"', \
                    gender='", req.body.gender,"', \
                    preference='", req.body.preference,"', \
                    bio='", req.body.bio, "', \
                    tags='", req.body.hugs, "', \
                    img0='", req.body.img0, "', \
                    img1='", req.body.img1, "', \
                    img2='", req.body.img2, "', \
                    img3='", req.body.img3, "', \
                    img4='", req.body.img4, "' \
                    WHERE id=", req.session.userid, ";");
        connection.query(qr, (error) => {
            if (error) {
                console.log(error);
            }
        });
    } 
    // else if (req.body.del1) {
    //     const qr = "UPDATE User SET img1='' WHERE id=".concat(req.session.userid, ";");
    //     connection.query(qr, (error) => {
    //         if (error) {
    //             console.log(error);
    //         }
    //     });
    // } else if (req.body.del2) {
    //     const qr = "UPDATE User SET img2='' WHERE id=".concat(req.session.userid, ";");
    //     connection.query(qr, (error) => {
    //         if (error) {
    //             console.log(error);
    //         }
    //     });
    // } else if (req.body.del3) {
    //     const qr = "UPDATE User SET img3='' WHERE id=".concat(req.session.userid, ";");
    //     connection.query(qr, (error) => {
    //         if (error) {
    //             console.log(error);
    //         }
    //     });
    // } else if (req.body.del4) {
    //     const qr = "UPDATE User SET img4='' WHERE id=".concat(req.session.userid, ";");
    //     connection.query(qr, (error) => {
    //         if (error) {
    //             console.log(error);
    //         }
    //     });
    // }
    res.redirect('/profile');
});

module.exports = router