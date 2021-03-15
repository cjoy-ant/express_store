require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { NODE_ENV } = require("./config");
const { v4: uuid } = require("uuid");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(express.json());
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

const users = [
  {
    id: "3c8da4d5-1597-46e7-baa1-e402aed70d80",
    username: "sallyStudent",
    password: "c00d1ng1sc00l",
    favoriteClub: "Cache Valley Stone Society",
    newsLetter: "true",
  },
  {
    id: "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
    username: "johnBlocton",
    password: "veryg00dpassw0rd",
    favoriteClub: "Salt City Curling Club",
    newsLetter: "false",
  },
];

app.post("/", (req, res) => {
  console.log(req.body);
  res.send("POST request received.");
});

/*
{
  "username": "String between 6 and 20 characters",
  "password": "String between 8 and 36 characters, must contain at least one number",
  "favoriteClub": "One of 'Cache Valley Stone Society', 'Ogden Curling Club', 'Park City Curling Club', 'Salt City Curling Club' or 'Utah Olympic Oval Curling Club'",
  "newsLetter": "True - receive newsletters or False - no newsletters"
}
*/

// creating a new user in the database
app.post("/register", (req, res) => {
  console.log(req.body);
  const { username, password, favoriteClub, newsLetter = false } = req.body;
  const clubs = [
    "Cache Valley Stone Society",
    "Ogden Curling Club",
    "Park City Curling Club",
    "Salt City Curling Club",
    "Utah Olympic Oval Curling Club",
  ];

  // validation
  /*
   need return statement to tell it that
   this is all it needs to validate/send
   otherwise, if it takes longer to get a response, it may
   try to run subsequent code (e.g., res.send(200))
   and cause errors
  */
  if (!username) {
    return res.status(400).send("Username Required");
  }
  if (!password) {
    return res.status(400).send("Password Required");
  }
  if (!favoriteClub) {
    return res.status(400).send("Favorite Club Required");
  }

  if (username.length < 6 || username.length > 20) {
    return res.status(400).send("Username must be between 6 and 20 characters");
  }
  if (password.length < 8 || password.length > 36) {
    return res
      .status(400)
      .send("Password must be between 8 and 36 characters.");
  }

  // REGEX validation
  /*
    code block //
    ? optional
    . repeating
    * any of these
    REGEX supports ranges
    \d digits
  */
  // at least 8 characters
  // at least 1 letter and 1 digit
  // everything else can be upper or lowercase characters/digits
  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res.status(400).send("Password must contain at least one digit");
  }

  if (!clubs.includes(favoriteClub)) {
    return res.status(400).send("Not a valid club");
  }

  // generate a unique id/UUID (at some point)
  /*
    universally unique identifier
    numbers cap out at 11 integers
    UUID allows for no limit
    install UUID
  */
  const id = uuid();

  const newUser = {
    id,
    username,
    password,
    favoriteClub,
    newsLetter,
  };

  users.push(newUser);

  //res.status(200).send("All validation passed. User created.");
  //res.status(204).end();
  res.status(201).location(`http://localhost:8000/user/${id}`).json(newUser);
});

// DELETE
app.delete("/user/:id", (req, res) => {
  const { id } = req.params;

  const index = users.findIndex((u) => u.id === id);

  // if it doesn't find anyone === -1
  if (index === -1) {
    return res.status(404).send("User not found.");
  }

  // (which index to delete (stored in variable), # to delete)
  users.splice(index, 1);

  //res.send("User deleted.");
  res.status(204).end();
});

// GET individual user - dynamic url
app.get("/user/:id", (req, res) => {
  console.log(req.params);
});

// GET full list of users
app.get("/user", (req, res) => {
  res.json(users);
});

app.get("/", (req, res) => {
  res.send("A GET Request");
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
