const mysql = require('mysql');

const connection = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: 'pass',
   database: 'matcha'
})
connection.connect();

connection.query('USE matcha;')
connection.query("CREATE TABLE IF NOT EXISTS matcha.user \
                  (id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, \
                  email VARCHAR(50) NOT NULL UNIQUE, \
                  username VARCHAR(30) NOT NULL, \
                  firstname VARCHAR(30) NOT NULL, \
                  lastname VARCHAR(30) NOT NULL, \
                  password VARCHAR(255) NOT NULL, \
                  gender VARCHAR(30), \
                  preference VARCHAR(30) DEFAULT 'Bisexual', \
                  bio VARCHAR(255), \
                  online INT(6) DEFAULT 0,\
                  rating INT(6) DEFAULT 0,\
                  tags LONGTEXT, \
                  lat DECIMAL(10, 8), \
                  lng DECIMAL(11, 8), \
                  img0 LONGTEXT, \
                  img1 LONGTEXT, \
                  img2 LONGTEXT, \
                  img3 LONGTEXT, \
                  img4 LONGTEXT);", (error) => {
                        if (error)
                            console.log(error);
                  });

module.exports = connection;