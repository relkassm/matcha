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
            connection.query("UPDATE user SET lat = ? , lng = ? WHERE id = ? ;", [pos.latitude, pos.longitude, req.session.userid], (error) => {
                if (error) {
                    console.log(error);
                }
            });    
        });

        connection.query("SELECT * FROM user WHERE user.id = ? ;", req.session.userid, (error, rows) => {
            if (error) {
                console.log(error);
            } else {
                var row = rows[0];
                connection.query("SELECT tag.label FROM tag INNER JOIN user_tag ON tag.id=user_tag.id_tag WHERE user_tag.id_user = ? ORDER BY time asc;", req.session.userid, (error, rows1) => {
                if (error) {
                    console.log(error);
                } else {
                    var tags = '';
                    for (var i = 0; i < rows1.length; i++) {
                        tags = tags.concat('#', rows1[i].label, " ");
                    }
                    res.render('profile', { title: 'Profile', row, tags, session});
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
        connection.query("UPDATE user SET email = ?,\
                        username = ?, \
                        lastname = ?, \
                        firstname = ?, \
                        age = ?, \
                        password = ?, \
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
                        req.body.password,
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
        connection.query("SELECT * FROM tag;", (error, tag_list) => {
            if (error) {
                console.log(error);
            } else {
                var flag = 0;
                for (var i = 0; i < tag_list.length; i++) {
                    if (req.body.tag == tag_list[i].label) {
                        flag = 1;
                        connection.query("INSERT INTO user_tag (id_user, id_tag, time) VALUES (?, (SELECT tag.id FROM tag WHERE tag.label = ? ), now());", [req.session.userid, req.body.tag], (error) => {
                            if (error) {
                                console.log(error);
                            }
                        });
                    }
                }
                if (flag == 0 && req.body.tag) {
                    connection.query("INSERT INTO tag (label) VALUES (?);", req.body.tag, (error) => {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            connection.query("INSERT INTO user_tag (id_user, id_tag, time) VALUES (?, (SELECT tag.id FROM tag WHERE tag.label = ? ), now());", [req.session.userid, req.body.tag], (error) => {
                                if (error) {
                                    console.log(error);
                                }
                            });
                        }
                    });
                }
            }
        });
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