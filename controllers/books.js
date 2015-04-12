var Book = require('../models/book');

exports.get = function(req, res, next) {
  Book.find()
  .limit(req.param('limit') || 6)
  .exec()
  .then(function(books) {
    res.json(books);
    next();
  });
}