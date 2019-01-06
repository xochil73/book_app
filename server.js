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

//=======================
// Routes 
//=======================

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.get('/', home);
app.get('/index', ejsTest);

app.post('/searches', search);
app.get('/new', newSearch);

app.get('/books/:id', bookDetail);


app.post('/books/:id', bookDetail);

app.post('/books', addBook);

// Edit route
app.get('/books/edit/:id', editBook)
app.post('/books/edit/:id', editBook)

app.get('*', (req, res) => res.status(404).send('This route does not exist'));

function ejsTest(req, res) {

  res.render('pages/index.ejs');

}


//=======================
// Database - SQL Setup
//=======================

const client = new pg.Client(process.env.DATABASE_URL);

client.connect()
.then(() => console.log('connected'))
.catch(err => console.error('connection error', err.stack))
client.on('error', err => console.error('|||||||||||client.on|||||||||||||',err));

//=======================
// New Search
//=======================
function newSearch(req, res){
  res.render('pages/searches/new.ejs');
}

//=======================
// Search Function
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
// Save to DB Function
//=======================

function addBook(req, res) {
  
  let newBook = new GoogleBook(req.body);
  let bookArray = Object.values(newBook)
  bookArray.pop();
  const SQL = `INSERT INTO books
  (title, author, isbn, image_url, description, bookshelf)
  VALUES($1, $2, $3, $4, $5, $6)`;
  
  return client.query(SQL, bookArray)
  .then(res.redirect('/'))
  .catch(err => console.error('|||||||||||||||||||addBook||||||||||||||||||||', err));
}


//=======================
// SQL Data Display
//=======================

//Home Bookshelf
function home(req, res) {
  
  client.query('SELECT * FROM books')
  .then(data => {
    function uniq(a, param){
      return a.filter(function(item, pos, array){
        return array.map(function(mapItem){ return mapItem[param]; }).indexOf(item[param]) === pos;
      })
    }
    
    let temp = uniq(data.rows, 'title')
    res.render('pages/books/bookshelf', {books: temp});
  });
}

//=======================
// Single Book Details
//=======================

function bookDetail(req,res){
  
  let SQL = `SELECT * FROM books WHERE id=$1`;
  let values = [req.params.id];
  return client.query(SQL, values)
    .then(result => {
      console.log('Retrieve from DB');
      res.render('pages/books/detail.ejs', {book: result.rows[0]});
    })
    .catch(err => (err, res));
}

//=======================
// Edit Function
//=======================

function editBook(req, res) {
  let SQL = `SELECT * FROM books WHERE id=$1`;
  let values = [req.params.id];
  return client.query(SQL, values)
    .then(result => {
      console.log('|||||||||||||||||||||||test||||||||||||||||||||||')
      console.log('||||||||editBook|||||||||||', result)
      console.log('|||||||||||||||||||||||||||||||||||||||||||||')
      res.render('pages/books/edit.ejs', { book: result.rows[0] }, err => (console.error(err)), 
      )
    })
    .catch(err => {
      console.log(err, 'database request error')  
    })
  }



  //=======================
  // Localhost Listener
  //=======================
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  
  //=======================
  //=======================
// Constructor
function GoogleBook(book) {

  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

  this.title = book.title|| 'No authors available';
  this.author = book && book.volumeInfo && book.volumeInfo.authors || 'No authors available';
  this.isbn = book && book.volumeInfo && book.volumeInfo.industryIdentifiers && book.volumeInfo[0] && book.volumeInfo[0].type + book.volumeInfo.industryIdentifiers[0].identifier ? `ISBN_13 ${book.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image_url = book && book.volumeInfo && book.volumeInfo.imageLinks.thumbnail || placeholderImage;
  this.description = book.description || 'No description available';
  this.bookshelf = book.bookshelf || 'unassigned';
  // this.id = book.industryIdentifiers ? `${book.industryIdentifiers[0].identifier}` : '';
 
}



