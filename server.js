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
// app.get('/index.ejs', ejsTest);
app.set('view engine', 'ejs');


// function ejsTest(req, res) {
//   res.render('pages/index.ejs');
// }
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

function home(request, response) {
  response.render('pages/index');
}

//Helper Functions
function search(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=search';
  // console.log(request.body.search);
  const searchStr = request.body.search[0];
  const searchType = request.body.search[1];

  if(searchType === 'title') {
    url += `+intitle:${searchStr}`;
  } else if(searchType === 'author') {
    url += `+inauthor:${searchStr}`;
  }
 
//search engine
 return superagent.get(url)
    .then(result => {
      // console.log(result.body.items[1]);
      let books = result.body.items.map(book => new GoogleBook(book.volumeInfo))
      // console.log(GoogleBook.title);
        .then (result => 
      response.render('pages/searches/show', {books}))
      .catch(error => handleError(error));
        } 
             
//Constructor
function GoogleBook(book) {
  // console.log(book);
  this.title = book.volumeInfo.title || 'this book does not have a title';
  this.author = book.volumeInfo.authors || 'this book does not have an author';
  this.description = book.volumeInfo.description || 'this book does not have a description';
  this.imageLinks = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpeg';
}


// Error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong')
};
