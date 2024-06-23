import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/client/user";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne(email, []);
        if (!user)
          return done(null, false, { message: "Invalid credentials." });

        const isValid = await User.validatePassword(
          user.password as string,
          password
        );
        if (!isValid)
          return done(null, false, { message: "Invalid credentials." });
        //@ts-ignore
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findByAuthId(profile.id);

        if (!user) {
          user = await User.create({
            verification_status: "verified",
            auth_id: profile.id,
            auth_type: "google",
            avatar: profile?.photos?.[0].value,
            first_name: profile.name?.givenName as string,
            last_name: profile.name?.familyName,
            email: profile.emails?.[0].value as string,
          });
        }
        //@ts-ignore
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
