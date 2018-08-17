const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Note = require("./models/Note");

const PORT = process.env.PORT || 3001;

const app = express();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/testdb");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// have all of our api routes
app.get("/api/notes", function(req, res){
  Note.find({}).then(dbModel => res.json(dbModel));
})
app.post("/api/create", function(req, res){
  Note.create(req.body).then(dbModel => res.json(dbModel));
})

app.listen(PORT, () => {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
