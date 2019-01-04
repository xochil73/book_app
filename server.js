'use strict';

//dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));
require('dotenv').config();

//post/get/set
app.post('/searches', search);
app.get('/index.ejs', ejsTest);
app.set('view engine', 'ejs');
app.get('/', home);
app.post('/tasks', addBook);
app.get('/addBook', showForm);
app.get('/books/:id', bookDetail);

function bookDetail(req, res) {
  console.log(req.body, 'HERE I AM!');
  let SQL = `SELECT * FROM books WHERE id=$1`;
  let values = [req.params.id];
  return client.query(SQL, values)
    .then(result => {
      res.render('pages/books/show.ejs', {books: result.rows[0]});
    });
}

const client = new pg.Client('postgres://root:password@localhost:5432/books_app');
client.connect();
client.on('err', err => console.error(err));


function ejsTest(req, res) {
  res.render('pages/index.ejs');
}
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

function showForm(req,res) {
  res.render('pages/add-view');
}

//Home Bookshelf
function home(req, res) {
  client.query('SELECT * FROM books')
    .then(data => {
      console.log(data, 'home data');
      res.render('pages/books/bookshelf.ejs', {books: data.rows});
    });
}

function addBook(req, res) {

  const values = Object.values(req.body);
  const SQL = `INSERT INTO books
              (title, author, isbn, image_url, description)
              values($1, $2, $3, $4, $5)`;
  console.log('||||||||||||||||||||||||', client.query(SQL, values));
  return client.query(SQL, values)
    .then(res.redirect('/'))
    .catch(error => {
      console.log(error);
      res.send(error);
    });
}

//Helper Functions
function search(request, response) {

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  return superagent.get(url)
    .then(result => {
      let books = result.body.items.map(book => new GoogleBook(book.volumeInfo));
      response.render('searches/show', {books});

    })
    .catch(error => handleError(error));
}
//Constructor
function GoogleBook(book) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

  this.title = book.title || 'No title available';
  this.author = book.authors[0] || 'No authors available';
  this.isbn = book.industryIdentifiers ? `ISBN_13 ${book.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image_url = book.imageLinks.smallThumbnail ? book.imageLinks.smallThumbnail : placeholderImage;
  this.description = book.description || 'No description available';
  this.id = book.industryIdentifiers ? `${book.industryIdentifiers[0].identifier}` : '';
}

// Error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}
