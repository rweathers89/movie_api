//Import necessary libraries and modules
const mongoose = require('mongoose'); // mongoose for interacting with MongoDB
const Models = require('./models.js'); // import custome data models
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

//connects to MongoDB Atlas database
mongoose.connect(process.env.CONNECTION_URI,
  { useNewUrlParser: true, useUnifiedTopology: true });
//connects to local database. swap with .connect function above if needed.
//mongoose.connect('mongodb://localhost:27017/cfDB',
//  { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  app = express();

app.use(morgan('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors()); //allows requests from all origins

//replace app.use(cors()) with code below to ONLY allow CERTAIN origins
/*
let allowedOrigins = ['http://localhost:8080',
  'http://testsite.com',
  'http://localhost:1234', 'https://movie-api-nj6m.onrender.com/',
  'https://mymoviemix-rweathers-c19185.netlify.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { //if a specific origin isn't found on the list of allowed origins
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
})); //END app.use(cors)
*/

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

/**
 * Welcome Page
 * @name /
 * @function
 * @returns {string} Welcome message
 */
app.get('/', (req, res) => {
  res.send('Welcome to my app!');
});//end app.get

//USER INFO
//CREATE -- new user
/**
 * Create a new user
 * @name CreateUser
 * @function
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Object} The created user object
 */
app.post('/users',
  [
    check('Username', 'Username is requires').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  async (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            }) //end .create
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            }) // end .catch
        } //end else
      }) // end then (user)
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }); //END app.post(/users)


//READ -- get all users
/**
 * Get a list of all users
 * @name GetUsers
 * @function
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Object[]} Array of user objects
 */
app.get('/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
      });
  }); //END app.get(users)

//READ -- get a user by name
app.get('/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }); //END app.get(users/username)

//UPDATE
/**
 * Update user information
 * @name UpdateUser
 * @function
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Object} The updated user object
 */
app.put('/user/:Username', [
  //validation
  check('Username', 'Username is required').notEmpty(),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').notEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
],
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    //check validation object errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    //Condition to check added here
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    } // Condition Ends
    await Users.findOneAndUpdate({ Username: req.params.Username },
      {
        $set:
        {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true }) //This line makes sure that the updated document is retured
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      })
  }); //END update app.put(users/username)

//CREATE -- add a movie to a user's list of favorite movies
/**
 * Add a favorite movie to a user's list
 * @name AddFavoriteMovie
 * @function
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Object} The updated user object
 */
app.post('/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }); //END update app.post user's fav movie

// Delete a user by username
/**
 * Delete a user by username
 * @name DeleteUser
 * @function
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {string} Success message
 */
app.delete('/users/:Username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
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
  }); // END delete by username

//Delete a favorite movie from username
/**
 * Remove a favorite movie from a user's list
 * @name RemoveFavoriteMovie
 * @function
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Object} The updated user object
 */
app.delete('/users/:Username/movies/:MovieID',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
      });
  }); //END delete movie from username

//MOVIES info
//READ -- get all movies
/**
 * Get a list of all movies
 * @name GetMovies
 * @function
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Object[]} Array of movie objects
 */
app.get('/movies', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error ' + error);
      });
  }); //END app.get(movies)

//READ -- a single movie
/**
 * Get a movie by title
 * @name GetMovieByTitle
 * @function
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Object} The movie object
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });//END get movie by ID

//READ -- genre by name
/**
 * Get genres from movies
 * @name GetGenresFromMovies
 * @function
 * @memberof module:routes
 * @inner
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Object[]} Array of movie objects
 */
app.get('/movies/genre/:genreName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ 'Genre.Name': req.params.genreName })
      .then((movie) => {
        res.status(200).json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });//END get genre by name

//READ - info about a director
/**
 * Get data about a director by name
 * @name GetDirector
 * @function
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {string} name - The name of the director to retrieve
 * @returns {Object} The director object
 */
app.get('/movies/directors/:directorName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ 'Director.Name': req.params.directorName })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });//END get director

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

/**
 * Start the server
 * @name StartServer
 * @function
 * @memberof module:server
 * @param {number} port - The port number on which the server will listen
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port)
});//end app.listen

console.log('My first Node test server is running on Port 8080.');

