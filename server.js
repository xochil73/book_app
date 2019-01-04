'use strict';

//=============
// Dependencies
//=============
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

//=======================
// Routes
//=======================
app.post('/searches', search);
app.post('/book', addBook);

app.get('/index', home);
// app.get('/books/:books_id', renderBook);
app.get('/new', newSearch);
app.get('*', (req, res) => res.status(404).send('This route does not exist'));

//=======================
// Database - PostgresSQL
//=======================

const client = new pg.Client(process.env.DATABASE_URL);

client.connect()
  .then(() => console.log('connected'))
  .catch(err => console.error('connection error', err.stack))
client.on('error', err => console.error('|||||||||||client.on|||||||||||||',err));
console.log(client.query)

function addBook(req, res) {
  console.log('|||||||||||addBook req|||||||||||||', req)
  
  let newBook = new GoogleBook(req.body);
  let bookArray = Object.values(newBook)
  const SQL = `INSERT INTO books
              (title, author, isbn, image_url, description)
              VALUES($1, $2, $3, $4, $5)`
  
  return client.query(SQL, bookArray)
    .then(res.redirect('/'))
    .catch(err => console.error('|||||||||||||||||||addBook||||||||||||||||||||', err));
  }
  
  //=======================
  // Home Route
  //=======================
function home(req, res) {
  const SQL = 'SELECT * FROM books';
  console.log('|||||||||||||||||||home||||||||||||||||||||', client.query(SQL))
  return client.query(SQL)
    .then(data => {
      res.render('pages/index', {data: data.rows});
    })
    .catch(error => res.render('pages/error', {error}));
}

function newSearch(req, res){
  res.render('pages/searches/new.ejs');
}

//=======================
// Helper Functions
//=======================
function search(req, res) {
  
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }
  return superagent.get(url)
    .then(result => {
      let books = result.body.items.map(book => new GoogleBook(book.volumeInfo));
      res.render('searches/show', {books});

    let SQL = `INSERT INTO books
    (title, author, isbn, image_url, description)
    VALUES ($1, $2, $3, $4, $5)`;
    let values = books[0];
    
    return client.query(SQL, [values.title, values.author, values.isbn, values.image_url, values.description]);

    })
    .catch(err => console.error('|||||||||||||||||||search||||||||||||||||||||', err));
}

  //=======================
  // Localhost Listener
  //=======================
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  
  //=======================
// Constructor
//=======================
function GoogleBook(book) {

  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

  this.title = book.title || 'No title available';
  this.author = book.authors[0] || 'No authors available';
  this.isbn = book.industryIdentifiers ? `ISBN_13 ${book.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image_url = book.imageLinks.smallThumbnail ? book.imageLinks.smallThumbnail : placeholderImage;
  this.description = book.description || 'No description available';
  this.id = book.industryIdentifiers ? `${book.industryIdentifiers[0].identifier}` : '';
 
}



