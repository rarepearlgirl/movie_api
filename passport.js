const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  Models = require('./models.js'),
  passportJWT = require('passport-jwt');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy(
    {
      usernameField: 'Name',
      passwordField: 'Password',
    },
    (username, password, callback) => {
      console.log(username + '  ' + password);
 
    Users.findOne({ Name: username })
      .then((user) => {
        if (!user) {
          console.log('Incorect Username');
          return callback(null, false, { message: 'Incorrect Username or Password' });
        }
        console.log('Finished');
        return callback(null, user)
      })
      .catch((error) => {
        console.log(error);
        return callback(error);
      });
  }
));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'MyJWTSecret'
}, (jwtPayload, callback) => {
  return Users.findById(jwtPayload._id)
    .then((user) => {
      return callback(null, user);
    })
    .catch((error) => {
      return callback(error)
    });
}));