const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Student = require("../models/student");
const Recruiter = require("../models/recruiter");

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user =
          (await Student.findOne({ email })) ||
          (await Recruiter.findOne({ email }));
        if (!user) return done(null, false, { message: "User not found" });

        const isMatch = await user.verifyPassword(password);
        if (!isMatch)
          return done(null, false, { message: "Incorrect password" });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  console.log("Deserializing user ID:", id);

  try {
    const user = (await Student.findById(id)) || (await Recruiter.findById(id));
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
