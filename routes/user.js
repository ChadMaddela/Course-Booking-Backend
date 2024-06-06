const express = require('express');
const userController = require('../controllers/user');
const passport = require('passport');
const {verify, verifyAdmin, isLoggedIn} = require("../auth");
const router = express.Router();



router.post("/checkEmail", userController.checkEmailExists);

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getProfile);

router.post("/enroll", verify, userController.enroll);

router.get("/getEnrollments", verify, userController.getEnrollments);

router.get('/google',
		passport.authenticate('google', {
			scope: ['email', 'profile'],
			prompt: "select_account"
		})
	);

router.get('/google/callback',
		passport.authenticate('google', {
			failureRedirect: '/users/failed',
		}),
		function (req, res){
			res.redirect('/users/success')
		}
	);

router.get('/failed', (req, res) => {
	console.log("User is not authenticated");
	res.send("Failed")
})

router.get('/success', isLoggedIn, (req, res) => {
	console.log('You are logged in');
	console.log(req.user);
	res.send(`Welcome ${req.user.displayName}`)
})

router.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log('Error while destroying session:', err);
		} else {
			req.logout(() => {
				console.log("You are logged out");
				res.redirect('/');
			});
		}
	});
});

// POST route for password reset
router.put('/reset-password', verify, userController.resetPassword);

// POST route for updating profile
router.put('/profile', verify, userController.updateProfile);

router.put('/updateAdmin', verify, verifyAdmin, userController.updateAdmin);

router.put('/enrollmentUpdate', verify, verifyAdmin, userController.updateEnrollmentStatus);

module.exports = router;

