# Learn 2018 BE
[![Build Status](https://travis-ci.org/ben-sooryen/learn2018-be.svg?branch=cit)](https://travis-ci.org/ben-sooryen/learn2018-be)


## Getting Started
First, ensure you have node and mongo installed on your system.

```sh
# Clone repo
git clone https://github.com/ben-sooryen/learn2018-be.git

# Install dependencies
npm install

# Run it
npm start

# Try it!
curl -H "Content-Type: application/json" -X POST -d '{"username":"jamesdean", "email": "example@gmail.com", "password":"password1"}' http://localhost:8080/users
```

## NPM Scripts

- **`npm start`** - Start live-reloading development server
- **`npm test`** - Run test suite
- **`npm run test:watch`** - Run test suite with auto-reloading
- **`npm run coverage`** - Generate test coverage
- **`npm run build`** - Generate production ready application in `./build`
