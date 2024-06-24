import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/client/user";

passport.use(
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const application_id = req.body?.application_id;
        const user = await UserModel.findOne(email, application_id, []);
        if (!user)
          return done(null, false, { message: "Invalid credentials." });

        const isValid = await UserModel.validatePassword(
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
      callbackURL: process.env.GOOGLE_REDIRECT_URL || "",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      const { application_id, type } = req.query.state
        ? JSON.parse(req.query.state as string)
        : undefined;
      try {
        let user = await UserModel.findOne(profile.id, application_id);

        if (!user) {
          user = await UserModel.create({
            verification_status: "verified",
            auth_id: profile.id,
            application_id,
            type,
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
