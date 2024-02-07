const express = require("express");
bodyParser = require('body-parser'),
  uuid = require('uuid');

const morgan = require("morgan");

const mongoose = require("mongoose");
const Models = require("./models.js");
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
//mongodb+srv://draculahgirl:<password>@cluster0.triplny.mongodb.net/?retryWrites=true&w=majority//
mongoose.connect("mongodb+srv://draculahgirl:7cBC1LVGLZ8KdOOU@cluster0.triplny.mongodb.net/myFlixDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });


  const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Authentication & Login Endpoint
const passport = require('passport'); // JWT Authentication
app.use(passport.initialize());
require('./passport');

const allowedOrigins = ['http://localhost:4200', 'https://rarepearlgirl.github.io'];

app.use(cors());
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         // If a specific origin isn't found on the list of allowed origins
//         let message =
//           `The CORS policy for this application doesn't allow access from origin ` +
//           origin;
//         return callback(new Error(message), false);
//       }
//       return callback(null, true);
//     },
//   })
// );
let auth = require('./auth')(app) // Login HTML Authentication

let myLogger = (req, res, next) => {
  console.log(req.url);
  next();
};

let requestTime = (req, res, next) => {
  req.requestTime = Date.now();
  next();
};

app.use(myLogger);
app.use(requestTime);
app.use(morgan("common"));



//default text response when at /
app.get("/", (req, res) => {
  res.send("Welcome!");
});

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// get a movie by the title
app.get('/movies/:Title', (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get a director by name
app.get('/movies/directors/:DirectorName', (req, res) => {
  Movies.findOne({ "Director.Name": req.params.DirectorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get all users
app.get("/users", function (req, res) {
  Users.find()
    .then(function (users) {
      res.status(201).json(users);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// allow users to register
app.post('/users_add',
  [
    check('Name', 'Name is required').isLength({ min: 3 }),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    console.log('Received body:', req.body); // Log the request body

    // check the validation object for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const hashedPassword = Users.hashPassword(req.body.Password);

    const userData = {
      Name: req.body.Name,
      Password: hashedPassword, // Use the hashed password here
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }

    // const token = jwt.sign(payload, 'yourSecretKey', { expiresIn: '1h' });

    const user = new Users(userData);
    user.save()
      .then(() => {
        res.status(201).json({ message: 'User saved successfully'});
      })
      .catch(error => {
        res.status(500).json({ error: `An error occurred while saving the user: ${error.message}` });
      })
  });

//get a user by username
app.get('/users/:Username', (req, res) => {
  console.log(req.params.Username);  // Added
  Users.findOne({ Name: { $regex: new RegExp(`^${req.params.Username}$`, 'i') } })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.put('/users/:Username', (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const hashedPassword = Users.hashPassword(req.body.Password);

  const userData = {
    Name: req.body.Name,
    Password: hashedPassword, // Use the hashed password here
    Email: req.body.Email,
    Birthday: req.body.Birthday
  }

  Users.findOneAndUpdate(
    { Name: req.params.Username },
    { $set: userData }
  )
    .then(() => {
      res.send({ message: "success" });
    })
    .catch(err => {
      res.status(500).send("Error" + err);
    });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/favoriteMovies/:MovieTitle', (req, res) => {
  Users.findOneAndUpdate({ Name: req.params.Username }, {
    $push: { favoriteMovies: req.params.MovieTitle }
  })
    .then(() => {
      res.send({ message: "success" });
    })
    .catch(err => {
      res.status(500).send("Error" + err);
    });;
});

// delete a movie (with exec)
app.delete('/users/:Username/favoriteMovies/:MovieTitle', (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Username },
    { $pull: { favoriteMovies: req.params.MovieTitle } }
  )
    .exec() // Add the .exec() method to execute the query
    .then(() => {
      res.send({ message: "success" });
    })
    .catch(err => {
      res.status(500).send("Error" + err);
    });
});


// Delete a user by username
app.delete('/users/:Name', (req, res) => {
  Users.findOneAndRemove({ Name: req.params.Name })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Name + ' was not found');
      } else {
        res.status(200).send(req.params.Name + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get a genre 
app.get('/movies/genres/:GenreName', (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.GenreName })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//access documentation.html using express.static
app.use('/documentation', express.static('public'));

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

// const port = process.env.PORT || 8080;
// app.listen(port, '0.0.0.0', () => {
//   console.log('Listening on Port ' + port);
// });

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});