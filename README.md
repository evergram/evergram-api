#Evergram API

[![Shippable](https://img.shields.io/shippable/557f6f2fedd7f2c052192752.svg)](https://app.shippable.com/projects/557f6f2fedd7f2c052192752)

An API for Evergram

###Install Node.JS

In the terminal:

```
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.24.0/install.sh | bash

nvm install stable
```

###Clone

```
git clone git@github.com:evergram/evergram-api.git
```

###Init

```
cd evergram-api
npm install
```

###Run

```
npm start
```

###Examples

#### Auth a user

```
http://localhost:8080/user/auth/instagram
```


###Testing

```
npm test
```

This will execute `jshint` and `jscs` for code style checks and the call `mocha` to run tests in `./test`
