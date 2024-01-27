const express = require('express'), 
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      uuid = require('uuid'),
      app = express();

app.use(morgan('common'));  
app.use(bodyParser.json()); 


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
        'Bio': 'Felix Gary Gray began his career as a music video director including award-winning music videos "It Was a Good Day" by Ice Cube, "Waterfalls" by TLC, and "Ms. Jackson" by Outkast. Gray made his feature film directorial debut with the comedy Friday (1995). He has since directed the films Set It Off (1996), The Italian Job (2003), and Straight Outta Compton (2015). He also directed the eighth installment of the Fast & Furious franchise, The Fate of the Furious (2017)',
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


app.get('/', (req, res) => {
    res.send('Welcome to my app!');
});//end app.get

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


