const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const Note = require("./models/Note");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();


const passport = require("passport");
const { Strategy:JwtStrategy, ExtractJwt } = require("passport-jwt");

const passportOpts = {
  // Set Extraction method to pull it out from our header
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // Our secrt
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(
    passportOpts,
    (jwt_payload, done) => {
      console.log(jwt_payload);
      User.findOne({_id: jwt_payload._id}, (err, user) => {
        if(err){ return done(err, false); } // if we have a problem remove it
        console.log("user", user);
        if(user){
          done(null, user);
        } else {
          done(null, false);
        }
      });
    }
));


const PORT = process.env.PORT || 3001;

const app = express();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/testdb");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
// have all of our api routes
app.get("/api/notes", function(req, res){
  Note.find({}).then(dbModel => res.json(dbModel));
})
app.post("/api/create", function(req, res){
  Note.create(req.body).then(dbModel => res.json(dbModel));
})

app.get("/api/private/route", passport.authenticate('jwt', {session: false}), (req, res) => {
  res.json({accessible: true});
});

app.post("/api/auth/register", function(req, res){
  if(!req.body.username || !req.body.password){
    return res.json({success: false, message: "Please provide a username and password"});
  }

  var newUser = new User({
    username: req.body.username,
    password: req.body.password
  });

  newUser.save(err => {
    if(err){
      return res.json({ success: false, message: "Username taken" });
    }
    return res.json({success: true, message: "Successfully create a new User!"});
  })
})

app.post("/api/auth/login", (req, res) => {
  if(!req.body.username || !req.body.password){
    return res.json({success: false, message: "Please provide a username and password"});
  }
  User.findOne({
    username: req.body.username
  }, (err, user) => {
    if(!user){
      // we don't have this user, we can't login
      return res.status(401).send({success: false, message: "Incorrect username or password"});
    }
    else {
      user.comparePassword(req.body.password, (err, isMatch) => {
        if(!err && isMatch){
          // we're going you
          const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
          res.json({success: true, token: "JWT " + token });
        } else {
          return res.status(401).send({success: false, message: "Incorrect username or password"});
        }
      })
    }
  })
})

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
