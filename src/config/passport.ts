import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/user";
import { BasicStrategy } from "passport-http";
import { Strategy as ClientPasswordStrategy } from "passport-oauth2-client-password";
import Client from "../models/clients";

// Local Strategy for user login
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "User not found" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
          return done(null, false, { message: "Invalid credentials" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// Basic Strategy for client authentication
passport.use(
  new BasicStrategy(async (clientId, clientSecret, done): Promise<any> => {
    try {
      const client = await Client.findOne({ clientId });
      if (!client) return done(null, false);

      if (client.clientSecret !== clientSecret) return done(null, false);

      return done(null, client);
    } catch (err) {
      return done(err);
    }
  }),
);

// Client Password Strategy for client authentication
passport.use(
  new ClientPasswordStrategy(
    async (clientId, clientSecret, done): Promise<any> => {
      try {
        const client = await Client.findOne({ clientId });
        if (!client) return done(null, false);

        if (client.clientSecret !== clientSecret) return done(null, false);

        return done(null, client);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// User serialization for sessions
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// User deserialization from sessions
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
