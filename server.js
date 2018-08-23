const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const Note = require("./models/Note");

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

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
