var express = require('express');
var passport = require('passport');
// authentication middleware for Node.js
var session = require('express-session');
// allows us to identify a user across more than one page request or visit to a site, and to store info about that user.
var bodyParser = require('body-parser');
var pg = require('pg');
// lets us communicate with postgres/sql
var localStrategy = require('passport-local').Strategy;
// lets us authenticate users via username and password, provided by module's Strategy object

// LOCAL
var index = require('./routes/index');
var register = require('./routes/register');
var users = require('./routes/users');
var connectionString = 'postgres://localhost:5432/passport-guide';
var bcrypt = require('bcrypt');

var encryptLib = require('../modules/encryption');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
// ^^^ This will connect the form data into a request.body for jquery. W/o it'll be confused because it won't be json.


// SESSION CONFIGURATION
app.use(session({
  secret: 'secret',
    // secret word placed on the cookie as another level of authentication
  resave: true,
    // forces the session to be saved back to the session store.
  saveUninitialized: false,
  // *** ??? controlling who's getting what session. set to false in dev mode. Not clear on this ***
  cookie: { maxAge: 600000, secure: false }
  // grants user temporary access in each session for a period of time since their last interaction.
  // usually more like 60000, but more here for us in dev. Age of the session is stored in the cookie.
}));

app.use(passport.initialize());
app.use(passport.session());
// The session needs to be configured BEFORE we app.use our session. Otherwise it won't work correctly.
// So always put this below our app.use(session...)

// PASSPORT
// we're telling passport which stratedy to use inside our server.js file.
// *** we should always use local in development - what does this change to for production??

passport.use('local', new localStrategy({
  passReqToCallback: true,
  usernameField: 'username'
  // the verify callback for local authentication accepts username and password arguments, submitted to
  // the app via login form. usernameField: 'username' needs to match name="username" on our form.
  // From this form info we'll authenticate users. Also needs to match the query on register.js
  },
  function(request, username, password, done) {
    console.log('called local');
    // We will come back to complete this, go to passport.serializeUser and passport.deserializeUser creation.
    pg.connect(connectionString, function(err, client){
      console.log('called local - pg, CHECKING PASSWORD');

      var user = {};
        var query = client.query("SELECT * FROM users WHERE username = $1", [username]);

      query.on('row', function (row) {
        console.log('User obj', row);
        console.log('Password', password);
        user = row;

        // Check password:
        if (encryptLib.comparePassword(password, user.password)){
          console.log('Match!');
          done(null, user);
          // this will then trigger passport.serializeUser to run via passport, we don't call it. The 'user' in that function, is this 'user'.
        } else {
          done(null, false, { message: 'Incorrect username and password.' });
        }
      });

      // After all data is returned, close connection
      query.on('end', function () {
        client.end();
      });

      // Handle errors
      if (err) {
        console.log(err);
      }
    });


}));

// Here we'll create the rest of the function for authenticating users. Serialize and deserialize
// allow user information to be stored and retrieved from session.
passport.serializeUser(function(user, done){
  console.log('Hit serializeUser');
  done(null, user.id); // Trail of breadcrumbs back to user. When we serialize, we send this down to the client as just a very small portion of it's object and data associated with it which happens on login. The "dehydrated" version. It'll then keep the user.id assigned to it for use during the session so that when it makes any further requests from this point (deserializes), it'll have that 'id' which can then be "re-hydrated", and have access to all the data associated.

});

passport.deserializeUser(function(id, done) {
  // Different than done() in pg function^^, if we use this and done() in pg, we'd rename the above
  // done to passportDone or something to help us not get an error.
  // This happens when a request occurs after initial login, full access to user object info "hydrated" from "dehydrated" id.
  console.log('Hit deserializeUser');
  pg.connect(connectionString, function(err, client){

    if (err) {
      console.log(err);
    }

    var user = {};
    console.log('Called deserializeUser - pg');
      var query = client.query("SELECT * FROM users WHERE id = $1", [id]);

    query.on('row', function (row) {
      console.log('User row', row);
      user = row;
      done(null, user);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
      client.end();
    });
  });

});

// Routes - good to put them above the server so that we have everything running that
// need before we use them.
app.use(express.static('server/public'));
app.use('/', index);
// app.use('/', register);
app.use('/register', register);
app.use('/users', users);

// Listening
var server = app.listen(process.env.PORT || 3000, function(){
  var portGrabbedFromLiveServer = server.address().port;
  console.log('Listening on port', portGrabbedFromLiveServer);
});
