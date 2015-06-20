# Virtual Bookcase

A 3D virtual bookcase written in three.js

## Requirements

1. Node.js(>=0.10.0)
2. MongoDB(>=2.6)

## Run

Make sure MongoDB is running first.

```bash
# import the data
mongoimport mock.json --db bookcase --collection books --jsonArray

# install dependencies
npm install

# build and start
grunt
```

## TODO

- [ ] Grunt task to minify JS code(with require.js optimizer)
- [ ] Move book cover color extraction into Web Workes
- [ ] Refactor main.js, move out object loaders
