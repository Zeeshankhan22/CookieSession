const express=require('express')
const mongoose=require('mongoose')
const bodyparser=require('body-parser')

const session = require("express-session");                               //1 Passport Js Modules
const passport = require("passport");
const passlocalmon = require("passport-local-mongoose");


//Middlewares
const app=express()
app.set('view engine','ejs')
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static('public'))

app.use(session({                                                         //2 Setup Session Configration From Browse -> npm express-session
  secret: 'My Little Secret',
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize())                                           //3. Initialize Session
app.use(passport.session())                                              //4. Using Passport Session


//Database
mongoose.connect('mongodb://127.0.0.1:27017/passportjspracdb')
const userScheme=mongoose.Schema({
    Email:String,
    Password:String

})

userScheme.plugin(passlocalmon)                                         //5. Add Mongoose Scheme Plugin,  From Browse -> npm passport-local-mongoose     

const User=mongoose.model('User',userScheme)

passport.use(User.createStrategy());                                   //6. Create Strategy and Serialize & Deserialize, From Browse -> npm passport-local-mongoose    
// passport.serializeUser(User.serializeUser());                       //  Serialize & Deserialize only use for sessions, its create and Destroy Cookie's
// passport.deserializeUser(User.deserializeUser());


passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

//Main Routes
app.route('/')
.get((req,res)=>{
    res.render('home')

})


//Register Route
app.route('/register')
.get((req,res)=>{
    res.render("register")
})
.post(function(req,res){

    User.register({ username: req.body.username }, req.body.password)                     //7.Setup Register, From Browse -> npm passport-local-mongoose , Examples before Licence
      .then(() => {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets")})
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/register");
      })


})


//Secrets Route                                                                           //8. Find User is Authenticated or Not & Cookie Save or Not
app.route("/secrets").get(function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

//Login Route
app.route("/login").get((req, res) => {
  res.render("login");
})

.post((req,res)=>{

    const user1 = new User({
      Email: req.body.usermail,
      Password: req.body.password,
    })

    req.login(user1, function (err) {                                                      //9. Use passport To Login the User and Authenticate him, 
       if (err) {                                                                          //   From Browse -> Passport.js ->Documentation -> Authentication -> Login
        console.log(err)
      }else{
        passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets") })
      } 
    })                                                                           
                                                                                   
})


//Logout Route
app.route('/logout').get((req,res)=>{                                                      //10. Setup LogOut, From Browse Passport.js -> Documentation -> Authentication -> LogOut

  req.logout((err)=>{
    if (err) {
      return next(err);
    }
    res.redirect("/");
  })
})



//Listen Route
app.listen(3000,()=>console.log("Server Run's On 3000 Port"))