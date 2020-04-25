const mysql = require('mysql');

const con = mysql.createConnection({
  host: process.env.AWS_HOST,
  user: process.env.AWS_USER,
  password: process.env.AWS_PASSWORD
});

con.connect(function (err) {
  if (err) {
    console.log(err)
    throw err
  }

  console.log("CONNECTED");

  // con.query('CREATE DATABASE IF NOT EXISTS authUser;');
  con.query('USE authUser;');
  con.query('CREATE TABLE IF NOT EXISTS authUser.users(id SERIAL PRIMARY KEY, first_name VARCHAR(255), last_name VARCHAR(255), username VARCHAR(255), password VARCHAR(255), user_id INT));', function (error, result, fields) {
    console.log(result);
  });

  /*con.query('ALTER TABLE contactList.contacts CHANGE COLUMN `id` `contacts_id` SERIAL', function (error, result, fields) {
    console.log('result', result);
  });*/

  con.query('CREATE TABLE authUser.posts(id SERIAL PRIMARY KEY, user_id INT, username VARCHAR(255), post_title VARCHAR(255), post_text VARCHAR(2000), FOREIGN KEY (user_id) REFERENCES authUser.users(user_id));', function (error, result, fields) {
    console.log('result', result);
  });

  con.end();
});

/*
DROP DATABASE IF EXISTS `authUser`;
CREATE DATABASE `authUser`;
USE `authUser`;

-- client
CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(250) NOT NULL,
  PRIMARY KEY (`user_id`)
);

-- invoices
CREATE TABLE `post` (
  `post_id` int(11) NOT NULL AUTO_INCREMENT,
  `post_title` varchar(50) NOT NULL,
  `post_text` varchar(1000) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`));
*/