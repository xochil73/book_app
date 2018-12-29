'use strict';

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));

app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.use(express.static('./public'));




app.post('/message', (request, response) => {
  console.log(request.body);
  response.sendFile('./thanks.html', {root: './public'});
})

app.get('/index.ejs', ejsTest);

function ejsTest(req, res) {
  res.render('pages/index.ejs');
}
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
