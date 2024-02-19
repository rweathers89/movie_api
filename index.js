//Import necessary libraries and modules
const mongoose = require('mongoose'); // mongoose for interacting with MongoDB
const Models = require('./models.js'); // import custome data models

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB', 
{ useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'), 
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      uuid = require('uuid'),
      app = express();

app.use(morgan('common'));  
app.use(express.json());
app.use(express.urlencoded({extended: true})); 



//Welcome Page
app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});//end app.get

//User info
//CREATE -- new user
app.post('/users', async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          }) //end .create
          .then((user) =>{res.status(201).json(user) })
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
app.get('/users', async (req, res) => {
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
app.get('/users/:Username', async (req, res) => {
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
app.put('/user/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username}, { $set:
 {
  Username: req.body.Username,
  Password: req.body.Password,
  Email: req.body.Email,
  Birthday: req.body.Birthday
 } 
},
{ new: true}) //This line makes sure that the updated document is retured
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
}); //END update app.put(users/username)

//CREATE -- add a movie to a user's list of favorite movies
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate (
    { Username: req.params.Username }, 
    { $push: { FavoriteMovies: req.params.MovieID} },
    {new: true}
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
app.delete('/users/:Username', async (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate(
    { Username: req.params.Username},
    {$pull: {FavoriteMovies: req.params.MovieID}},
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
app.get('/movies', async (req, res) => {
  await Movies.find()
  .then((movie) => {
    res.status(201).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
}); //END app.get(movies)

//READ -- a single movie
app.get('/movies/:Title', async (req, res) => {
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
app.get('/movies/genre/:genreName', async (req, res) => {
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
app.get('/movies/directors/:directorName', async (req, res) => {
  await Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});//END get director

/*
use bodyParser for Express versions below 4.16 - ref exercise 2.8
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 

let users = [
  {
    id: 1,
    name: 'Maxine',
    favoriteMovies: []
  },
  {
    id: 2,
    name: 'Andre',
    favoriteMovies: ['Hidden Figures']
  },
]

let movies = [
  {
    'Title': 'Set it Off',
    'Genre': {
      'Name': 'Action',
      'Description': 'A fast-paced, goal orientated narrative with elements of spectacular movements of bodies, vehicles, and weapons.',
    },
    'Description': 'Set It Off is a 1996 American heist crime action film following four close friends in Los Angeles, California, who plan to execute a bank robbery—each doing so for different reasons—to achieve better for themselves and their families.',
    'Director': {
        'Name': 'F. Gary Gray',
        'Bio': 'Felix Gary Gray began his career as a music video director including award-winning music video "Waterfalls" by TLC. Gray made his feature film directorial debut with the comedy Friday (1995). He has since directed the films Set It Off (1996), The Italian Job (2003), and Straight Outta Compton (2015).',
        'Birth Year': 1969
    },
    'ImageURL': 'https://en.wikipedia.org/wiki/Set_It_Off_(film)#/media/File:Set_it_off_poster.jpg',
    'Release Year': 1996
  },
  {
    'Title': 'Real Women Have Curves',
    'Genre': {
      'Name': 'Comedy',
      'Description': 'Comedies are designed to elicit laughter from the audience, crafted to amuse, entertain, and provoke enjoyment.',
    },
    'Description': 'Based on the play of the same name by Josefina López, Real Women Have Curves is a story of a first generation Mexican-American girl and her passage to womanhood. Although she wants to go away to college, she must battle against the views of her parents, who think she should stay at home and provide for the family.',
    'Director': {
        'Name': 'Patricia Cardoso',
        'Bio': 'Patricia Cardoso is a Colombian-American filmmaker and anthropologist. She was the first Latin woman to win a Sundance Film Festival Dramatic Audience Award and to receive a Student Academy Award for Real Women Have Curves. Cardoso was also the first Latin woman to have a film in the Library of Congress National film Registry.',
        'Birth Year': 1961
    },
    'ImageURL': 'https://en.wikipedia.org/wiki/Real_Women_Have_Curves#/media/File:Real_Women_Have_Curves_film_poster.jpg',
    'Release Year': 2002
    
  },
  {
    'Title': 'Hidden Figures',
    'Genre': {
      'Name': 'Drama',
      'Description': 'Dramas delve into the complexities of human emotions and stimulate deep contemplation and introspection.',
    },
    'Description': 'The story of a team of female African-American mathematicians who served a vital role in NASA during the early years of the U.S. space program.',
    'Director': {
        'Name': 'Theodore Melfi',
        'Bio': 'Theodore Melfi is a filmmaker who co-wrote, directed, and produced Hidden Figures with Allison Schroeder, for which he received Oscar nominations for Best Picture and Best Adapted Screenplay. His other works include: St. Vincent, starring Bill Murry, Starling, Winding Roads, and a short film title Daughter.',
        'Birth Year': 1970
    },
    'ImageURL': 'https://en.wikipedia.org/wiki/Hidden_Figures#/media/File:The_official_poster_for_the_film_Hidden_Figures,_2016.jpg',
    'Release Year': 2016
    
  }
] // END movies variable in json  


//CREATE
app.post('/users', (req, res) => {
    const newUser = req.body;

    if(newUser.name) {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).json(newUser)
    } else {
      res.status(400).send('users need name')
    }
});//end app.post(/users)


//UPDATE
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if(user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }

});//end app.put(/users/:id)

//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if(user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }

});//end app.post(/users/:id/:movieTitle)

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if(user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }

});//end app.delete(/users/:id/:movieTitle)

//DELETE
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if(user) {
    users = users.filter(user => user.id !== id);
    //res.json(users)
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }

});//end app.delete(/users/:id)

//READ
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});//end app.get /movies

//READ
app.get('/movies/:title', (req, res) =>{
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie)
  } else {
    res.status(400).send('no such movie')
  }

}); //end app.get(movies/:title)

//READ
app.get('/movies/genre/:genreName', (req, res) =>{
  const {genreName} = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre)
  } else {
    res.status(400).send('no such genre')
  }

}); //end app.get(movies/genre/:genreName)

//READ
app.get('/movies/directors/:directorName', (req, res) =>{
  const {directorName} = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director)
  } else {
    res.status(400).send('no such director')
  }

}); //end app.get(movies/directors/:directorName)
*/

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening to port 8080.')
});//end app.listen

console.log('My first Node test server is running on Port 8080.');

/*const http = require('http'),
    url = require('url');

http.createServer((request, response) => {
  let requestURL = url.parse(request.url, true);
  if (request.url.pathname == '/documentation.html') {
    response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Documentation on the bookclub API.\n');
  } else {
    response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Welcome to my book club!\n');
  }
  
}).listen(8080);*/


