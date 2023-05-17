const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const helper = require('../helpers/helper');
const db = require('../models');
const User = db.users;

const constants = require('../config/constants');
const jwtSecretKey = constants.jwtSecretKey;

// Setup options for JWT Strategy
const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = jwtSecretKey;

passport.use('user', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    console.log(payload, '---payload--');
    const existingUser = await User.findOne({
      where: {
        id: payload.data.id,
        login_time: payload.iat
      }
    });
    if (existingUser) {
      return done(null, existingUser);
    }
    return done(null, false);
  } catch (e) {
    console.log('Error during authentication:', e.message);
    return done(e, false);
  }
}));

const authenticateUser = (req, res, next) => {
  passport.authenticate('user', { session: false }, (err, user, info) => {
    if (err) {
      return helper.error(res, err);
    }
    if (info && info.name === 'JsonWebTokenError') {
      return helper.error(res, { message: 'Invalid Token.' });
    }
    if (info && info.name === 'TokenExpiredError') {
      return helper.error(res, { message: 'Token has expired. Please log in again.' });
    }
    if (!user) {
      return helper.error(res, { message: 'Authorization is required.' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = {
  initialize: () => passport.initialize(),
  authenticateUser: authenticateUser,
};

// const passport = require('passport');
// const JwtStrategy = require('passport-jwt').Strategy;
// const ExtractJWT = require('passport-jwt').ExtractJwt;
// const helper = require('../helpers/helper');
// const db = require('../models');
// const User = db.users

// const constants = require('../config/constants');
// const jwtSecretKey = constants.jwtSecretKey;

// // Setup options for JWT Strategy
// const jwtOptions = {};
// jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
// jwtOptions.secretOrKey = jwtSecretKey;

// // Create JWT Strategy
// // module.exports = passport => {
// passport.use('user', new JwtStrategy(jwtOptions,
//     async function (payload, done) {
//         try {
//             console.log(payload, '---payload--');
//             const existingUser = await User.findOne({
//                 where: {
//                     id: payload.data.id,
//                     // email: payload.data.email,
//                     login_time: payload.iat
//                 }
//             });
//             if (existingUser) {
//                 // console.log(existingUser.dataValues, '===============>loggedInUser');
//                 return done(null, existingUser);
//             }
//             return done(null, false);
//         } catch (e) {
//             console.log('not local');
//             console.log(e.message);
//             // return done(e, false);
//         }
//     }
// ));

// module.exports = {
//     initialize: function () {
//         return passport.initialize();
//     },
//     authenticateUser: function (req, res, next) {
//         console.log(req.user)
//         return passport.authenticate("user", {
//             session: false
//         }, (err, user, info) => {
//             // console.log(err, '=======================>passport err');
//             console.log(info, '=======================>passport info');
//             // console.log(info && info['name'], '=======================>passport info[name]');
//             console.log(user, '=======================>passport err user');

//             if (err) {
//                 return helper.error(res, err);
//             }
//             if (info && info.hasOwnProperty('name') && info.name == 'JsonWebTokenError') {
//                 return helper.error(res, {
//                     message: 'Invalid Token.'
//                 });
//             } else if (user == false) {
//                 return helper.error(res, {
//                     message: 'Authorization is required.'
//                 });
//             }
//             // Forward user information to the next middleware
//             req.user = user;
//             next();
//         })(req, res, next);
//     },
// };
