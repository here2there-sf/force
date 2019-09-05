# SF Force Backend


## Getting Started
First, ensure you have node and mongo installed on your system.

```sh
# Install dependencies
npm install

# Run it
npm start

# Try it!
curl -H "Content-Type: application/json" -X POST -d '{"username":"ben", "email": "example@gmail.com", "password":"password1"}' http://localhost:8080/users
```

## NPM Scripts

- **`npm start`** - Start live-reloading development server
- **`npm test`** - Run test suite
- **`npm run test:watch`** - Run test suite with auto-reloading
- **`npm run coverage`** - Generate test coverage
- **`npm run build`** - Generate production ready application in `./build`
