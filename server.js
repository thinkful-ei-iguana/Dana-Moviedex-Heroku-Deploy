require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const moviedex = require('./moviedex.json');

const app = express();

app.use(cors());
app.use(helmet());

app.use(morgan('dev'));

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  console.log('validate bearer token middleware');
  // move to the next middleware
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
});

const validTypes = ['genre', 'country', 'avg_vote'];

app.get('/movies', filterBy);

function filterBy(req, res) {
  const { genre, country, avg_vote } = req.query;
  let movieList = moviedex;
  if (genre) {
    movieList = filterByGenre(movieList, genre);
  }
  if (country) {
    movieList = filterByCountry(movieList, country);
  }
  if (avg_vote) {
    movieList = filterByAvgVote(movieList, avg_vote);
  }
  res.json(movieList);
}

function filterByGenre(movieList, genre) {
  let filteredList = movieList.filter(movie =>
    movie.genre.toLowerCase().includes(genre.toLowerCase())
  );
  return filteredList;
}
function filterByCountry(movieList, country) {
  let filteredList = movieList.filter(movie =>
    movie.country.toLowerCase().includes(country.toLowerCase())
  );

  return filteredList;
}
function filterByAvgVote(movieList, avg_vote) {
  let filteredList = movieList.filter(
    movie => Number(movie.avg_vote) >= Number(avg_vote)
  );
  return filteredList;
}

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
