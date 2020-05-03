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

// GET ALL POSTS viewposts.html - DONE
app.get("/viewposts", async (request, response) => {
  try {
    console.log("SEND VIEW POSTS PAGE");
    const con = await pool.getConnection();
    const result = await con.query(`SELECT * FROM authUser.post`);
    response.send(result[0]);
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
      .cookie('accessToken', accessToken)
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

// Sign in/Authenticate User - DONE
app.post("/users/login", async (request, response) => {
  try {
    console.log("AUTH USER");
    const myQuery = `SELECT * FROM authUser.user WHERE username='${request.body.username}';`;
    const con = await pool.getConnection();
    const result = await con.query(myQuery);
    con.release();

    const hashedPassword = result[0][0].password;
    const userID = result[0][0].user_id;

    if (await bcrypt.compare(request.body.password, hashedPassword)) {
      const userInfo = { username: request.body.username, user_id: userID };
      const accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET);
      // console.log('accesstoken', accessToken);

      response
        .status(200)
        .cookie('accessToken', accessToken)
        .redirect(301, "/users/landing");
    } else {
      response.sendStatus(403, 'Incorrect Password');
    }
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }
});

// GET users' landing - DONE
app.get("/users/landing", async (request, response) => {
  try {
    response.sendFile(path.join(__dirname, "/views/landing.html"));
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

// GET user's blogs - DONE
app.get('/blogPosts', authenticateToken, async (request, response) => {
  try {
    console.log("SEND USER'S POSTS");

    const userID = request.username.user_id;
    const authorName = request.username.username;

    const con = await pool.getConnection();
    const userInfo = await con.query(`SELECT * from authUser.post WHERE user_id='${userID}'`);

    response
      .status(200)
      .send({ author: authorName, data: userInfo });
    await con.release();
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }
});

// Middleware - DONE
function authenticateToken(request, response, next) {
  // Get the token that is sent
  const authHeader = request.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return response.sendStatus(401);

  // Verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, username) => {
    if (error) return response.sendStatus(403) //token exists but not valid
    request.username = username //pass username on to post
    next()
  });
}

// Logout - GET vs POST? POST doesn't reset cookie.. can still access users/landing
app.get('/logout', async (request, response) => {
  try {
    response
      .status(200)
      .cookie('accessToken', "")
      .redirect(303, "/");
  } catch (error) {
    console.log(error);
    response.status(500).send(error.message);
  }
});

const start = () => {
  return app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
}

module.exports = { start }