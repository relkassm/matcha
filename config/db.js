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
                  rating INT(6) DEFAULT 1000,\
                  lat DECIMAL(10, 8) ,\
                  lng DECIMAL(11, 8) ,\
                  online INT(6) DEFAULT 0,\
                  active INT(6) DEFAULT 0,\
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
                  (liker INT(6) UNSIGNED NOT NULL, \
                  liked INT(6) UNSIGNED NOT NULL, \
                  FOREIGN KEY (liker) REFERENCES user(id), \
                  FOREIGN KEY (liked) REFERENCES user(id));", (error) => {
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
                  time TIMESTAMP NOT NULL, \
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
                  time DATETIME NOT NULL, \
                  FOREIGN KEY (id_user0) REFERENCES user(id), \
                  FOREIGN KEY (id_user1) REFERENCES user(id), \
                  PRIMARY KEY (id_user0, id_user1));", (error) => {
                        if (error)
                            console.log(error);
                  });

connection.query("CREATE TABLE IF NOT EXISTS matcha.message \
                  (id_message INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,\
                  messager INT(6) UNSIGNED NOT NULL, \
                  messaged INT(6) UNSIGNED NOT NULL, \
                  message LONGTEXT,\
                  time DATETIME, \
                  FOREIGN KEY (messager) REFERENCES user(id), \
                  FOREIGN KEY (messaged) REFERENCES user(id) );", (error) => {
                        if (error)
                            console.log(error);
});

connection.query("CREATE TABLE IF NOT EXISTS matcha.visit \
                  (id_visit INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,\
                  visiter INT(6) UNSIGNED NOT NULL, \
                  visited INT(6) UNSIGNED NOT NULL, \
                  time DATETIME, \
                  FOREIGN KEY (visiter) REFERENCES user(id), \
                  FOREIGN KEY (visited) REFERENCES user(id) );", (error) => {
                        if (error)
                            console.log(error);
});

connection.query("CREATE TABLE IF NOT EXISTS matcha.notification \
                  (id_notif INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,\
                  notifier INT(6) UNSIGNED NOT NULL, \
                  notified INT(6) UNSIGNED NOT NULL, \
                  type INT(6), \
                  is_read INT(6) DEFAULT 0,\
                  time DATETIME, \
                  FOREIGN KEY (notifier) REFERENCES user(id), \
                  FOREIGN KEY (notified) REFERENCES user(id) );", (error) => {
                        if (error)
                            console.log(error);
});

module.exports = connection;