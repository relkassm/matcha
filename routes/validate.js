const connection = require("../config/db");
const express = require('express');
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const {token,email} = req.query;
        if (typeof email != 'undefined' && typeof token != 'undefined')
        {
            var [user] = await connection.execute("SELECT * FROM user WHERE token = ? AND email = ?",[token,email]);
            if(user[0]){
                const[up] = await connection.execute("UPDATE user SET confirmed = 1 WHERE email = ?",[email]);
                res.redirect('/login');
            }   
            else{
                console.log("account can not be verified");
            } 
        }
        else{
            console.log("error");
        }
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;