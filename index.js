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

/**
 * Handle GET requests to access all movies.
 *
 * @function
 * @name getAllMovies
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the movie request process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Object}[] allMovies - The array of all movies in the database.
 * 
 */

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


/**
 * Handle GET requests to access for a specific movie.
 *
 * @function
 * @name getMovie
 * @param {Object} req - Express request object with parameter: movieId (movie ID).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the movie request process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Object} reqMovie - The object containing the data for the requested movie.
 * 
 */

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


/**
 * Handle GET requests to access for a specific director.
 *
 * @function
 * @name getDirector
 * @param {Object} req - Express request object with parameter: directorName (director name).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the director request process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Object} reqDirector - The object containing the data for the requested director.
 * 
 */

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

/**
 * Handle POST requests to create a new user.
 *
 * @function
 * @name createUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the user creation process is complete.
 * @throws {Error} - If there is an unexpected error during the user creation process.
 * @returns {Object} newUser - The newly created user object. Sent in the response on success.
 * 
 */

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

/**
 * Handle PUT requests to update user information.
 *
 * @function
 * @name updateUser
 * @param {Object} req - Express request object with parameters: id (user ID).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the user update process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @fires {Object} updatedUser - The updated user object sent in the response on success.
 * @description
 *   Expects at least one updatable field (username, password, email, birthday) in the request body.
 */

//update user info
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


/**
 * Handle POST requests to add a movie to a user's favorites.
 *
 * @function
 * @name addFavoriteMovie
 * @param {Object} req - Express request object with parameters: id (user ID), movieId (movie ID).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the movie addition process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Object} updatedUser - The updated user object (including the added movie) sent in the response on success.
 */

// Add a movie to a user's list of favorites
app.post('/users/:Username/favoriteMovies/:MovieId', (req, res) => {
  Users.findOneAndUpdate({ Name: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieId }
  })
    .then(() => {
      res.send({ message: "success" });
    })
    .catch(err => {
      res.status(500).send("Error" + err);
    });
});

app.get('/users/:Username/favoriteMovies', (req, res) => {
  const username = req.params.Username;
  // Step 1: Find the user's favorite movie IDs
  Users.findOne({ username: username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userFavoriteMovieIds = user.FavoriteMovies;
      // res.json({ favoriteMovies: userFavoriteMovieIds });      
      Movies.find({ _id: { $in: userFavoriteMovieIds } })
        .then((favoriteMovies) => {
          if (!favoriteMovies) {
            return res.status(404).json({ error: "Favorite movies not found" });
          }

          // Return the filtered movies as response
          res.json({ favoriteMovies: favoriteMovies });
        })
        .catch((err) => {
          console.error("Error finding favorite movies:", err);
          res.status(500).json({ error: "Internal server error" });
        });
    })
    .catch((err) => {
      console.error("Error finding user:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

/**
 * Handle DELETE requests to remove a movie from a user's favorites.
 *
 * @function
 * @name removeFavoriteMovie
 * @param {Object} req - Express request object with parameters: id (user ID), movieId (movie ID).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the movie removal process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @fires {Object} updatedUser - The updated user object (after removing the movie) sent in the response on success.
 */

// delete a movie (with exec)
app.delete('/users/:Username/favoriteMovies/:MovieId', (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieId } }
  )
    .exec() // Add the .exec() method to execute the query
    .then(() => {
      res.send({ message: "success" });
    })
    .catch(err => {
      res.status(500).send("Error" + err);
    });
});

/**
 * Handle DELETE requests to delete a user.
 *
 * @function
 * @name deleteUser
 * @param {Object} req - Express request object with parameters: id (user ID).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the user deletion process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @fires {string} message - A message indicating the result of the user deletion process.
 */

// Delete a user by username
app.delete('/users/:UserId', (req, res) => {
  Users.findOneAndRemove({ _id: req.params.UserId })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.UserId + ' was not found');
      } else {
        res.status(200).send(req.params.UserId + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


/**
 * Handle GET requests to access for a specific genre.
 *
 * @function
 * @name getGenre
 * @param {Object} req - Express request object with parameter: genreName (genre name).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the genre request process is complete.
 * @throws {Error} - If there is an unexpected error during the process or if permission is denied.
 * @returns {Object} reqGenre - The object containing the data for the requested genre.
 * 
 */

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