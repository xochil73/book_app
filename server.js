'use strict';


//dependencies
const express = require('express');
const superagent = require('superagent');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

//post/get/set
app.post('/searches', search);
app.get('/index.ejs', ejsTest);
app.set('view engine', 'ejs');


function ejsTest(req, res) {
  res.render('pages/index.ejs');
}
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

function home(request, response) {
  response.render('pages/index.ejs');
}


//Cody's code


// function newSearch(request, response) {
//   response.render('pages/index');
// }

// function createSearch(request, response) {





// }
//Helper Functions
function search(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  // let url = 'https://www.googleapis.com/books/v1/volumes?q=search';
  // console.log(request.body.search);
  // const searchStr = request.body.search[0];
  // const searchType = request.body.search[1];

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  // if(searchType === 'title') {
  //   url += `+intitle:${searchStr}`;
  // } else if(searchType === 'author') {
  //   url += `+inauthor:${searchStr}`;
  // }


  //search engine
  // superagent.get(url)
  //   .then(apiResponse => apiResponse.body.items.map(book => new GoogleBook(book.volumeInfo)))

  //   .then(results => response.render('searches/show', {searchResults: results}))
  //   .catch(err => handleError(err, response));


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
  this.image_url = book.imageLinks ? book.imageLinks.smallThumbnail : placeholderImage;
  this.description = book.description || 'No description available';
  this.id = book.industryIdentifiers ? `${book.industryIdentifiers[0].identifier}` : '';
}
// function GoogleBook(book) {
//   // console.log(book);
//   this.title = book.volumeInfo.title || 'this book does not have a title';
//   this.author = book.volumeInfo.authors || 'this book does not have an author';
//   this.description = book.volumeInfo.description || 'this book does not have a description';
//   this.imageLinks = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpeg';
// }


// Error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}
