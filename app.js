if(process.env.NODE_ENV != "production"){
  require('dotenv').config()
}

const dbUrl=process.env.ATLASDB_URL;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const Listing = require("./models/listing"); 
const paymentRoutes = require("./routes/payment");
const bookingRouter = require("./routes/booking");


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/pradeep";
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



app.get("/",(req,res)=>{
  res.redirect("/listings");
});

// Test route to verify Stripe secret key works
app.get('/stripe/test-create-paymentintent', async (req, res) => {
  try {
    // Create a tiny test PaymentIntent (amount is in smallest currency unit; 100 = $1.00)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    // Return a small JSON to show it's working
    return res.json({ ok: true, client_secret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (err) {
    console.error("Stripe test error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static (path.join(__dirname,"/public")));

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter: 24*3600,
});

store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err);
});

const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000
  },
  httpOnly:true
}

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);
app.use("/", paymentRoutes);
app.use("/", bookingRouter);


passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/payment", (req, res) => {
  res.render("payment.ejs");
});


//Error Handling
app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong"}=err;
  res.status(statusCode).send(message);
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
