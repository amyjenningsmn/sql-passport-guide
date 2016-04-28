var express = require('express');
var router = express.Router();
var passport = require('passport');
var path = require('path');

var connectionString = 'postgres://localhost:5432/passport-guide';

router.get('/', function(request, response, next){
  response.sendFile(path.join(__dirname, "../public/views/index.html"))
});

router.post('/',
  passport.authenticate('local', {
    successRedirect: '/users',
    failureRedirect: '/'
  })
);
// ^^ passport.authenticate is specifying our 'local' strategy, and specifies
//    a failure and success redirect whenever anyone posts sends their login info.

module.exports = router;
