'use strict';

//=============
// Dependencies
//=============
//Globals
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();
const methodOverride = require('method-override');
var $ = require('jquery');


//Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

//Method-Override
app.use(methodOverride((req, res) => {
  if(req.body && typeof req.body === 'object' && '_method' in req.body){
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.set('view engine', 'ejs');
//=======================
// Routes
//=======================

//Home/Search route
app.get('/', home);
// app.post('/', home);
app.get('/index', searchPage);

//New search route
app.post('/searches', search);
app.get('/new', newSearch);

//Book Detail/Save route
app.get('/books/:id', bookDetail);
app.post('/books/:id', bookDetail);
app.post('/books', addBook);

//Edit/Update route
app.get('/books/edit/:id', editBook);
app.post('/books/edit/:id', editBook);

app.put('/books/edit/:id', updateBook)

//Delete route
app.delete('/books/:id', deleteBook);


app.get('*', (req, res) => res.status(404).send('This route does not exist'));

function searchPage(req, res) {
  res.render('pages/index');
}


//=======================
// Database - SQL Setup
//=======================

const client = new pg.Client(process.env.DATABASE_URL);

client.connect()
  .then(() => console.log('connected'))
  .catch(err => console.error('connection error', err.stack));
client.on('error', err => console.error('|||||||||||client.on|||||||||||||',err));

//=======================
// New Search
//=======================
function newSearch(req, res){
  res.redirect('/');
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
    let bookArray = Object.values(newBook);
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
        });
      }
      
      let temp = uniq(data.rows, 'title');
      res.render('pages/books/bookshelf', {books: temp});
    })
    .catch(err => console.error('|||||||||||||||||||Bookshelf||||||||||||||||||||', err));
  }
  
  //=======================
  // Single Book Details
  //=======================
  
  function bookDetail(req,res){
    
    let SQL = 'SELECT * FROM books WHERE id=$1';
    let values = [req.params.id];
    return client.query(SQL, values)
    .then(result => {
      console.log('Retrieve from DB');
      res.render('pages/books/detail', {book: result.rows[0]});
    })
    .catch(err => (err, res));
  }
  
  // //=======================
  // // Edit Function
  // //=======================
  
  function editBook(req, res) {
    
    let SQL = 'SELECT * FROM books where id=$1';
    let values = [req.params.id];
    return client.query(SQL, values)
      .then(result => {
        result.rows[0].title = req.body.title;
        result.rows[0].author = req.body.author;
        result.rows[0].description = req.body.description;
        result.rows[0].bookshelf = req.body.bookshelf;
        res.render('pages/books/edit', {book:result.rows[0]})
      })
      .catch(err => (err, res));
  }

  function updateBook(req, res){
    let SQL = `UPDATE books SET author=$1, title=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7`;
              
    let values = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description, req.body.bookshelf, req.params.id];
  
    client.query(SQL, values)
      .then(results => {
        res.redirect(`/books/${req.params.id}`);
      })
      .catch(err => handleError(err, res));
  }
  

  // //=======================
  // // Delete Function
  // //=======================
  
  function deleteBook(req, res) {
    console.log(`|||||||||||||deleteBook|||||||||||||| ${req.params.id}`);
    client.query(`DELETE FROM books WHERE id=$1`, [req.params.id])
      .then(result => {
        console.log(result);
        res.redirect('/');
      })
        .catch(err => console.error('|||||||||||||||||||deleteBook||||||||||||||||||||', err)); 
      }
  
     
  //=======================
  // Localhost Listener
  //=======================
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

  //=======================
  // Error Handler
  //=======================
      
  function handleError (err, response) {
    console.error(err);
    response.render('pages/error', err);
  }
      
      
  //=======================
  // Constructor
  //=======================

  function GoogleBook(book) {

    const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = book.title|| 'No title available';
    this.author = book.authors || 'No authors available';
    this.isbn = book && book.volumeInfo && book.volumeInfo.industryIdentifiers && book.volumeInfo[0] && book.volumeInfo[0].type + book.volumeInfo.industryIdentifiers[0].identifier ? `ISBN_13 ${book.industryIdentifiers[0].identifier}` : 'No ISBN available';
    this.image_url = book && book.volumeInfo && book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail || placeholderImage;
    this.description = book.description || 'No description available';
    this.bookshelf = book.bookshelf || 'unassigned';

  }






  

