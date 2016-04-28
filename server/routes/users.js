var express = require('express');
var router = express.Router();

router.get('/', function(request, response, next){
  response.send(request.isAuthenticated());
  // this will send us a 'true' if we login successfully 
});

module.exports = router;
