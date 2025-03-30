if(process.env.NODE_ENV != 'production'){
    require('dotenv').config()
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')

const listingRouter = require("./routes/listing")
const reviewRouter = require("./routes/review")
const userRouter = require("./routes/user")

const MONGO_URL = 'mongodb://127.0.0.1:27017/mydb'
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user");
const user = require('./models/user');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dbUrl = process.env.ATLASDB_URL
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(methodOverride("_method"))
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))
require('./google-config');


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter: 24*3600
})
store.on("error", () => {
    console.log("ERROR IN MONGO SEESION")
})
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
}



// app.get("/", (req,res) =>{
//     res.send("Hi, I am root")
// })

app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists in DB (if using a database)
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                profilePic: profile.photos[0].value
            });
            await user.save();
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

// Google Auth Route
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }),
    (req,res) => {
        res.locals.currUser = req.user
    }
    
);

// Google Auth Callback
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.locals.currUser = req.user
        res.redirect('/listings'); // Redirect after login
    }
);

// Logout Route
// app.get('/logout', (req, res) => {
//     req.logout(() => {
//         res.redirect('/');
//     });
// });

app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/google');
    }
    res.send(`Welcome, ${req.user.name}! <a href="/logout">Logout</a>`);
});


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// const dbUrl = MONGO_URL
main().then(()=>{
    console.log("Connected to DB")
})
.catch((err)=> {
    console.log("Error : ", err)
})

async function main() {
    await mongoose.connect(dbUrl)
}

app.use((req,res,next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currUser = req.user
    next()
})

app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter)

// app.get('/testlisting', async(req,res) => {
//     let sampleListing = new Listing({
//         title: "My vila",
//         description: "This is a sample description for 2nd one",
//         price: 1199,
//         location: "Delhi",
//         country: "India"
//     })

//     await sampleListing.save()
//     console.log("Sample Listing created successfully")
//     res.send("Successfully created")
// })

app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page Not Found!"))
})

app.use((err,req,res,next) => {
    let {statusCode=500, message="Something went wrong!"} = err
    // res.status(statusCode).send(message)
    res.render("error.ejs", {statusCode, message})
    // res.send("Some error occurred")
})

app.listen(8080, () => {
    console.log("listening on port 8080")
})