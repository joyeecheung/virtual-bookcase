var express = require('express');
var router = express.Router();
var serveBooks = require('../controllers/books')

router.get('/books', function(req, res, next) {
  serveBooks.get(req, res);
});

module.exports = router;
