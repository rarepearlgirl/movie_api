const express = require("express");
bodyParser = require('body-parser'),
  uuid = require('uuid');

const morgan = require("morgan");

const mongoose = require("mongoose");
const Models = require("./models.js");
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/cfDB'),
// // mongoose.connect(process.env.CONNECTION_URI,
//   { useNewUrlParser: true, useUnifiedTopology: true };

// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Database connected successfully'))
//   .catch(err => console.error('Database connection error:', err));

mongoose?.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true,  },
  () => {
    console.log('Connected to MongoDB');
  }
);

  const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Authentification & Login Endpoint
const passport = require('passport'); // JWT Authentification
app.use(passport.initialize());
require('./passport');

app.use(cors());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn't found on the list of allowed origins
        let message =
          `The CORS policy for this application doesn't allow access from origin ` +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
let auth = require('./auth')(app) // Login HTML Authentification

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
}); //NEW CODE

//return JSON object when at /movies
app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// get a movie by the title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/directors/:DirectorName', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get("/users", passport.authenticate('jwt', { session: false }), function (req, res) {
  console.log(req.params.Username);  // Ad
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
app.post('/users',
  [
    check('Name', 'Name is required').isLength({ min: 3 }),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {

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
    const user = new Users(userData);
    user.save()
      .then(() => {
        res.status(201).json({ message: 'User saved successfully' });
      })
      .catch(error => {
        res.status(500).json({ error: `An error occurred while saving the user: ${error.message}` });
      })
  });

//get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.params.Username);  // Added
  Users.findOne({ Name: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.patch('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  const movieData = req.body;

  Users.findOneAndUpdate(
    { name: req.params.Username },
    { $set: movieData }
  )
    .then(() => {
      res.send({ message: "success" });
    })
    .catch(err => {
      res.status(500).send("Error" + err);
    });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/favoriteMovies/:MovieTitle', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ name: req.params.Username }, {
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
app.delete('/users/:Username/favoriteMovies/:MovieTitle', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
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
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Name: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get a genre 
app.get('/movies/genres/:GenreName', passport.authenticate('jwt', { session: false }), (req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});

// app.listen(8080, () => {
//   console.log('App listening on port 8080');
// });