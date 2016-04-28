var bcrypt = require('bcrypt');

var SALT_WORK_FACTOR = 10;
// 10 is the baseline default, you can increase it to make it more complex. Increasing this number
// will make this much larger, so don't go much past 25, 10 should be totally fine.

var publicAPI = {
  encryptPassword: function(password) {
    var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    // extra randomness sprinkled inside password to make it even more unique
    // and only to that particular one, no pattern recognition.
    console.log('Produced a salt of:', salt);
    var encryptedPassword = bcrypt.hashSync(password, salt);
    // we pass in password and the salt we created ^^^^^^^ to create a new hash
    console.log('Created password of:', encryptedPassword);
    // this is just for development, this would def not be something we'd do in production!
    return encryptedPassword;
  },
  comparePassword: function(candidatePassword, storedPassword){
    console.log('Comparing', candidatePassword, 'to', storedPassword);
    var answer = bcrypt.compareSync(candidatePassword, storedPassword);
    console.log('The answer is', answer);
    return answer;
  }
}

module.exports = publicAPI;
