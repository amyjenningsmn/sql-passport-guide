var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');
// var Users = require('../models/user');
// what should this be? a User schema?
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/passport-guide';
var bcrypt = require('bcrypt');

var encryptLib = require('../../modules/encryption');



router.get('/', function(request, response, next){
  console.log('User', request.user);
  console.log('Is authenticated', request.isAuthenticated());
  response.sendFile(path.join(__dirname, "../public/views/register.html"));

});

router.post('/', function(request, response, next){
  console.log('Register requested with a body containing:', request.body);
  pg.connect(connectionString, function(err, client){

    var user = {
      username: request.body.username,
      password: encryptLib.encryptPassword(request.body.password)
    };

    console.log('Creating user', user);

      var query = client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [user.username, user.password]);
      // request.body.username and request.body.password: 'username' and 'password' need to be the same
      // as our register.html name="username" name="password" parts of our form. Also needs to match
      // our usernameField: 'username' in passport.use on server.js

      query.on('error', function(err){
        console.log(err);
      });

      query.on('end', function(){
        response.sendStatus(200);
        client.end();
      })

  })
});


module.exports = router;
