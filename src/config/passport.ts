import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Request } from "express";
import User from "../models/user"; // Adjust the path as needed
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: false, // ❌ REMOVE if not using req
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        // let user = await User.findOne({ googleId: profile.id });

        // if (!user) {
        //   user = new User({
        //     googleId: profile.id,
        //     displayName: profile.displayName,
        //     email: profile.emails?.[0]?.value || "",
        //     profilePicture: profile.photos?.[0]?.value || "",
        //   });
        //   await user.save();
        // }

        return done(null, profile);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

// Serialize & Deserialize User (Required for session support)
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser(async (user: any, done) => {
  try {
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
