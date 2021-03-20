const mysql = require('mysql2');

const connections = mysql.createPool({
   host: 'localhost',
   user: 'root',
   password: 'pass',
   database: 'matcha',
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0
})
 const connection = connections.promise();


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
                  age INT(6),\
                  country VARCHAR(30), \
                  confirmed INT(6) DEFAULT 0,\
                  rating INT(6) DEFAULT 0,\
                  lat DECIMAL(10, 8) ,\
                  lng DECIMAL(11, 8) ,\
                  online INT(6) DEFAULT 0,\
                  active INT(6) DEFAULT 1,\
                  token VARCHAR(255),\
                  last_con TIMESTAMP,\
                  img0 LONGTEXT, \
                  img1 LONGTEXT, \
                  img2 LONGTEXT, \
                  img3 LONGTEXT, \
                  img4 LONGTEXT);", (error) => {
                        if (error)
                            console.log(error);
                  });

connection.query("CREATE TABLE IF NOT EXISTS matcha.like \
                  (id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, \
                  liker INT(6) UNSIGNED NOT NULL, \
                  liked INT(6) UNSIGNED NOT NULL, \
                  FOREIGN KEY (liker) REFERENCES user(id), \
                  FOREIGN KEY (liked) REFERENCES user(id));", (error) => {
                        if (error)
                            console.log(error);
                  });

connection.query("CREATE TABLE IF NOT EXISTS matcha.dislike \
                  (id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, \
                  disliker INT(6) UNSIGNED NOT NULL, \
                  disliked INT(6) UNSIGNED NOT NULL, \
                  FOREIGN KEY (disliker) REFERENCES user(id), \
                  FOREIGN KEY (disliked) REFERENCES user(id));", (error) => {
                        if (error)
                            console.log(error);
                  });

connection.query("CREATE TABLE IF NOT EXISTS matcha.tag \
                  (id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, \
                  label VARCHAR(30) NOT NULL UNIQUE);", (error) => {
                        if (error)
                            console.log(error);
                  });

connection.query("CREATE TABLE IF NOT EXISTS matcha.user_tag \
                  (id_user INT(6) UNSIGNED, \
                  id_tag INT(6) UNSIGNED, \
                  time TIMESTAMP NOT NULL,\
                  FOREIGN KEY (id_user) REFERENCES user(id), \
                  FOREIGN KEY (id_tag) REFERENCES tag(id), \
                  PRIMARY KEY (id_user, id_tag));", (error) => {
                        if (error)
                            console.log(error);
                  });
connection.query("CREATE TABLE IF NOT EXISTS matcha.block \
                  (blocker INT(6) UNSIGNED NOT NULL, \
                  blocked INT(6) UNSIGNED NOT NULL, \
                  FOREIGN KEY (blocker) REFERENCES user(id), \
                  FOREIGN KEY (blocked) REFERENCES user(id), \
                  PRIMARY KEY (blocker, blocked));", (error) => {
                        if (error)
                            console.log(error);
});

connection.query("CREATE TABLE IF NOT EXISTS matcha.report \
                  (reporter INT(6) UNSIGNED NOT NULL, \
                  reported INT(6) UNSIGNED NOT NULL, \
                  FOREIGN KEY (reporter) REFERENCES user(id), \
                  FOREIGN KEY (reported) REFERENCES user(id), \
                  PRIMARY KEY (reporter, reported));", (error) => {
                        if (error)
                            console.log(error);
});

connection.query("CREATE TABLE IF NOT EXISTS matcha.match \
                  (id_user0 INT(6) UNSIGNED, \
                  id_user1 INT(6) UNSIGNED, \
                  time TIMESTAMP NOT NULL,\
                  FOREIGN KEY (id_user0) REFERENCES user(id), \
                  FOREIGN KEY (id_user1) REFERENCES user(id), \
                  PRIMARY KEY (id_user0, id_user1));", (error) => {
                        if (error)
                            console.log(error);
                  });

module.exports = connection;