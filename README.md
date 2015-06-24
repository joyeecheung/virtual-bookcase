# Virtual Bookcase

A 3D virtual bookcase written with three.js, backed by Express and MongoDB.

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
- [ ] Refactor main.js, move out object loaders

## About

* Author: Joyee Chueung<[joyeec9h3@gmail.com](mailto://joyeec9h3@gmail.com)>
* GitHub Repo: [joyeecheung/virtual-bookcase](https://github.com/joyeecheung/virtual-bookcase)
