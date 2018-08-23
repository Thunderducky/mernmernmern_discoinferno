const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const Note = require("./models/Note");
const User = require("./models/User");
const dotenv = require("dotenv");

const passport = require("passport");
const { Strategy:JwtStrategy, ExtractJwt } = require("passport-jwt");
dotenv.config();

const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 3001;

const passportOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(passportOpts,
(jwt_payload, done) => {
  User.findOne({_id: jwt_payload._id}, (err, user) => {
    if(err) {return done(err, false);}
    if(user){
      done(null, user);
    } else {
      done(null, false);
    }
  })
}));


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
app.post("/api/create",  function(req, res){
  Note.create(req.body).then(dbModel => res.json(dbModel));
})

app.get("/api/test", passport.authenticate('jwt', {session: false}), (req, res) => {
  res.json({accessible: true});
});

app.post("/api/auth/register", (req, res) => {
  console.log(req.body);
  var user = new User({
    username: req.body.username,
    password: req.body.password
  });
  user.save(err => {
    if(err){
      return res.json({success: false, message: "Username taken"});
    }
    return res.json({success: true, message: "Successfully created new user"});
  })
});

app.post("/api/auth/login", (req, res) => {
  User.findOne({
    username: req.body.username
  }, (err, user) => {
    if(!user){
      res.status(401).send({success: false, message: "wrong username"});
    } else {
      user.comparePassword(req.body.password, (err, isMatch) => {
          if(!err && isMatch){
            const token = jwt.sign({
              _id: user._id,
              username: user.username
            }, process.env.JWT_SECRET);

            res.json({success: true, token: "JWT " + token});
          } else {
            res.status(401).send({success: false, message: "wrong username or password"});
          }
      });
    }
  });
})

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
