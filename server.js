const express = require('express');
const session = require('express-session');
const app = express();










// DATABASE SETUP ##########
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/ojas");
const database = mongoose.connection;
database.once("open", ()=> {
  console.log("Connected to the database");
})
// END OF Database setup ######################

// Mongoose tests ##########
var Schema = mongoose.Schema;

var PostsSchema = new Schema({
  username: {type: String, default: "Anonymous"},
  text: {type: String, default:"No comment text"}
});

// Compile model from schema
var PostsModel = mongoose.model('posts', PostsSchema );
// END OF DATABASE SETUP ######################








// MIDDLEWARE ##########
app.set("view engine", "ejs");

//This middleware enables us to access form data from request.body.[name of input field]
app.use( express.urlencoded({extended:false}) );
app.use( session({secret:"This is a string used to encrypt session data."}) )
app.use(function(request, response, next){
  //If the user hasn't visited the website
  if(!request.session.user_data){
    request.session.user_data = {
      ip: request.ip,
      username: "Anonymous"
    }
  }
  //Move on to the next function
  next();
})
// END OF MIDDLEWARE ######################




// Routes ##########
app.get("/", function(request, response){
  console.log("Somebody visited the home page");
  response.render("index.ejs", {username:request.session.user_data.username})
});



app.get("/wall_page", function(request, response){
  console.log("Somebody visited the wall page");

  PostsModel.find()
  .exec(function(err, data){
    if(err){
      console.log(err);
      response.send("Could not look up users in database!");
    } else{
      console.log(data);
      response.render("wallpage.ejs", {username:request.session.user_data.username, wall_posts: data.reverse()});
    }
  });

});

app.post("/create_wall_post", function(request, response){
  console.log("Somebody posted to the wall page");
  console.log(request.body);

  if(request.body.username == ""){
    request.body.username = request.session.user_data.username;
  }

  const new_wall_post = new PostsModel({username: request.body.username, text: request.body.text});

  new_wall_post.save(function(err){
    if(err){
      console.log(err);
      response.send("There was an error saving to the database!")
    } else{
      response.redirect("/wall_page");
    }
  })

});



app.get("/second_page", function(request, response){
  console.log("Somebody visited the home page");
  response.render("page2.ejs", {username:request.session.user_data.username})
});

app.post("/set_user", function(request, response){
  console.log("BELOW IS THE FORM DATA");
  console.log(request.body);
  users.push(request.body.username);
  request.session.user_data.username = request.body.username;
  response.redirect("/");
});
app.get("/users", function(request, response){
  response.json(users);
})
// END OF Routes ######################

app.listen(3000, function(){
  console.log("Server online, visit at localhost:3000");
});

const users = [];
