require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const moviedex = require('./moviedex.json');

const app = express();

app.use(cors());
app.use(helmet());

const morganSetting =
  process.env.NODE_ENV === 'production'
    ? 'tiny'
    : 'common';
app.use(morgan(morganSetting));

app.use(function validateBearerToken(
  req,
  res,
  next
) {
  const apiToken =
    process.env.API_TOKEN;
  const authToken = req.get(
    'Authorization'
  );

  // move to the next middleware
  if (
    !authToken ||
    authToken.split(' ')[1] !== apiToken
  ) {
    return res.status(401).json({
      error: 'Unauthorized request'
    });
  }
  next();
});
//must be the last middleware
app.use((error, req, res, next) => {
  let response;
  if (
    process.env.NODE_ENV ===
    'production'
  ) {
    response = {
      error: { message: 'server error' }
    };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const validTypes = [
  'genre',
  'country',
  'avg_vote'
];

app.get('/movies', filterBy);

function filterBy(req, res) {
  const {
    genre,
    country,
    avg_vote
  } = req.query;
  let movieList = moviedex;
  if (genre) {
    movieList = filterByGenre(
      movieList,
      genre
    );
  }
  if (country) {
    movieList = filterByCountry(
      movieList,
      country
    );
  }
  if (avg_vote) {
    movieList = filterByAvgVote(
      movieList,
      avg_vote
    );
  }
  res.json(movieList);
}

function filterByGenre(
  movieList,
  genre
) {
  let filteredList = movieList.filter(
    movie =>
      movie.genre
        .toLowerCase()
        .includes(genre.toLowerCase())
  );
  return filteredList;
}
function filterByCountry(
  movieList,
  country
) {
  let filteredList = movieList.filter(
    movie =>
      movie.country
        .toLowerCase()
        .includes(country.toLowerCase())
  );

  return filteredList;
}
function filterByAvgVote(
  movieList,
  avg_vote
) {
  let filteredList = movieList.filter(
    movie =>
      Number(movie.avg_vote) >=
      Number(avg_vote)
  );
  return filteredList;
}

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {});
