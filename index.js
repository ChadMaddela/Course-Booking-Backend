require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Google Login
const passport = require('passport');
const session = require('express-session');
require('./passport');


// Allows our backend application to be available to our frontend application
// Allows us to control the app's Cross Origin Resource Sharing settings
const cors = require('cors');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

	// [Section] Google Login
	// Creates a session with the given data
	// resave prevents the session from overwriting the secret while the session is active
	// saveUninitialized prevents the data from storing data in the session while the data has not yet been initialized
app.use(session({
	secret: process.env.clientSecret,
	resave: false,
	saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect("mongodb+srv://admin:admin1234@wdc028-course-booking.smrreb4.mongodb.net/b390-course-booking-API?retryWrites=true&w=majority");
mongoose.connect("mongodb+srv://charlesmaddela:charlesmaddela@maddeladb.pkij7ln.mongodb.net/b390-course-booking-API?retryWrites=true&w=majority");


mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

app.use("/users", userRoutes)
app.use("/courses", courseRoutes);



// "process.env.PORT || port" will use the environment variable if it is available OR will used port 4000 if none is defined
// This syntax will allow flexibility when using the application locally or as a hosted application
if(require.main === module){
app.listen(process.env.PORT || port, () => console.log(`API is now online on port  ${process.env.PORT ||port}`));
}
module.exports = {app, mongoose};