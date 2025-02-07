const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./db');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (user.rows.length === 0) return done(null, false);
      
      const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
      if (!isValid) return done(null, false);
      
      return done(null, user.rows[0]);
    } catch (err) {
      return done(err);
    }
  }
));

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JWTStrategy(opts, async (jwtPayload, done) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [jwtPayload.id]);
    if (user.rows.length) return done(null, user.rows[0]);
    return done(null, false);
  } catch (err) {
    return done(err);
  }
}));