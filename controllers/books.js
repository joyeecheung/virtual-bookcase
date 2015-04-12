var Book = require('../models/book');

exports.get = function(req, res, next) {
  Book.find()
  .limit(6)
  .exec()
  .then(function(books) {
    console.log(books);
    res.json(books);
    next();
  });
}