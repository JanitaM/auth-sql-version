require('dotenv').config();

const PORT = process.env.PORT || 3000;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const mysql = require("mysql2/promise");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const path = require("path");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = mysql.createPool({
  host: process.env.AWS_HOST,
  user: process.env.AWS_USER,
  password: process.env.AWS_PASSWORD
});

// Serve static files - need this fo MIME errors
app.use(express.static(__dirname + "/views"));

// GET Home - DONE
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "/views/index.html")));

// index.html - DONE
app.get("/", async (request, response) => {
  try {
    console.log("SEND HOME PAGE");
    response.sendFile(path.join(__dirname, "/views/index.html"));
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }
})

// GET join.html - DONE
app.get("/join", async (request, response) => {
  try {
    console.log("SEND JOIN PAGE");
    response.sendFile(path.join(__dirname, "/views/join.html"));
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }
})

// GET viewposts.html - DONE
app.get("/viewposts", async (request, response) => {
  try {
    console.log("SEND VIEW POSTS PAGE");
    response.sendFile(path.join(__dirname, "/views/viewposts.html"));
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }
})

// GET all users - DONE
app.get("/users", async (request, response) => {
  console.log("GET ALL USERS");
  const con = await pool.getConnection();
  const result = await con.query(`SELECT * FROM authUser.user`);
  response.send(result[0]);
});

// POST a user - DONE
app.post("/user/join", async (request, response) => {
  try {
    console.log("POST USER");
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(request.body.password, salt);

    const con = await pool.getConnection();
    const result = await con.query(`INSERT INTO authUser.user (first_name, last_name, username, password) VALUES ('${request.body.firstName}', '${request.body.lastName}', '${request.body.username}', '${hashedPassword}')`);

    const userInfo = { username: request.body.username };

    const accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET);

    response
      .status(201)
      .cookie('blogAccessToken', accessToken)
      .redirect(303, '/signin');
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }
})

// GET signin.html - DONE
app.get("/signin", async (request, response) => {
  try {
    console.log("SEND SIGN IN PAGE");
    response.sendFile(path.join(__dirname, "/views/signin.html"));
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }
});

// Sign in/Authenticate User
app.post("/users/login", async (request, response) => {
  try {
    const myQuery = `SELECT * FROM authUser.user WHERE user.username='${request.body.username}';`;
    const con = await pool.getConnection();
    const result = await con.query(myQuery);
    con.release();

    console.log('result[0]', result[0]); //this works
    console.log('result[0][0].username', result[0][0].username); //this works

    const hashedPassword = result[0][0].password;
    const pullingUsername = result[0][0].username;

    if (await bcrypt.compare(request.body.password, hashedPassword)) {
      const userInfo = { username: request.body.username, username: pullingUsername };
      const accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET);
      console.log('accesstoken', accessToken); //this works

      response
        .status(202)
        .cookie('blogAccessToken', accessToken)
        .redirect(303, "/users/landing");
    } else {
      response.sendStatus(403, 'Incorrect Password');
    }
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }
});

// GET users' landing
app.get("/users/landing", async (request, response) => {
  try {
    response.sendFile(path.join(__dirname, "/views/landing.html"));
  } catch (error) {
    response.status(500).send(error);
  }
});

// GET users' blogs
app.get('/blogPosts', authorizeUser, async (request, response) => {
  try {
    const con = await pool.getConnection();
    const authorName = request.user.username;
    const userInfo = await con.query(`SELECT * FROM authUser.post WHERE user_id=(SELECT user_id FROM authUser.user WHERE username='${authorName}')`);

    response.status(200).send({ author: authorName, data: userInfo });
    await con.release();
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }
});

// Middleware 
function authorizeUser(request, response, next) {
  // Get the token that is sent
  const authHeader = request.header.authorization;
  console.log('authHeader', authHeader);
  const getToken = authHeader && authHeader.split(' ')[1];
  console.log('getToken', getToken);

  if (getToken == null) {
    return response.status(401).send("Invalid Token");
  }
  // Verify that it's the correct user
  jwt.verify(getToken, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return response.sendStatus(403) //valid token? then move on
    request.user = user //pass user on to post
    console.log(request.user);
    next()
  })
  // Return the user to the function that gets the posts
}

const start = () => {
  return app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
}

module.exports = { start }