var Book = require('../models/book');
var config = require('../config.js')

/**
 API for books: GET limited number of books
 */
exports.get = function(req, res) {
  Book.find()
  .select("-_id")  // no _id
  .lean()  // so that the properties can be modified
  .limit(Number(req.params.limit) || 12)
  .exec()
  .then(function(books) {
    // prefix the cover directory path
    // this needs that lean()
    books.forEach(function(book) {
      book.cover = config.cover_dir + book.cover;
    });
    res.json(books);  // send to client
  });
}