const User = require("../models/User");
const bcrypt = require('bcrypt');
const auth = require("../auth");
const Enrollment = require("../models/Enrollment");

// 409 = duplicate email
// 404 = no duplicate email
module.exports.checkEmailExists = (req, res) => {
    if (req.body.email.includes("@")) {
        User.find({ email: req.body.email })
            .then(result => {
                if (result.length > 0) {
                    return res.status(409).send({ error: 'Duplicate Email Found' });
                } else {
                    return res.status(200).send({ message: 'Email not found' });
                }
            })
            .catch(err => {
                console.error("Error in Find: ", err);
                return res.status(500).send({ error: 'Error in Find' });
            });
    } else {
        return res.status(400).send({ error: 'Invalid Email Format' });
    }
};

module.exports.registerUser = (req, res) => {
    if (typeof req.body.firstName !== 'string' || typeof req.body.lastName !== 'string') {
        return res.status(400).send("First name and last name must be strings");
    }

    if (!req.body.email.includes("@")) {
        return res.status(400).send("Email Invalid");
    }

    if (typeof req.body.mobileNo !== 'string' || req.body.mobileNo.length !== 11) {
        return res.status(400).send("Mobile number invalid");
    }


    if (req.body.password.length < 8) {
        return res.status(400).send("Password must be atleast 8 characters");
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        mobileNo: req.body.mobileNo,
        password: hashedPassword
    });

    newUser.save()
        .then(result => {
            res.status(201).send({message: 'Registered Successfully'});
        })
        .catch(saveErr => {
        console.error("Error in Save: ", saveErr)
        return res.status(500).send({ error: 'Error in Save'});
    	})
};


module.exports.loginUser = (req, res) => {

	if (req.body.email.includes("@")) {
		return User.findOne({ email : req.body.email})
		.then (result => {
			if(result == null) {
				return res.status(404).send({error: "No email found"});
			} else {
				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				if(isPasswordCorrect) {
					return res.status(200).send({access : auth.createAccessToken(result)});
				} else {
					return res.status(401).send({error: "Email and password do not match."});
				}
			}
		})
		.catch(findErr => {
        console.error('Error in find', findErr)
        return res.status(500).send({error: 'Error in find'});
    	})
	} else {
		 return res.status(400).send({error: 'Invalid in email'})
	}
};

module.exports.getProfile = (req, res) => {


	return User.findById(req.user.id)
	.then(user => {

		user.password = "";
		return res.status(200).send({ user });
	})
	.catch(findErr => {
        console.error("User not found: ", findErr)
        return res.status(404).send({ error: 'Failed to fetch user profile'});
    })
};

/*
- The first digit of the status code defines the class of response. The last two digits do not have any categorization role. There are five values for the first digit:
	- 1xx (Informational): The request was received, continuing process
	- 2xx (Successful): The request was successfully received, understood, and accepted
	- 3xx (Redirection): Further action needs to be taken in order to complete the request
	- 4xx (Client Error): The request contains bad syntax or cannot be fulfilled
	- 5xx (Server Error): The server failed to fulfill an apparently valid request
- HTTP response status codes indicate whether or not a specific HTTP request has been successfully completed
*/

module.exports.enroll = (req, res) => {

	console.log(req.user.id);
	console.log(req.body.enrolledCourses);

	if(req.user.isAdmin) {

		return res.status(403).send({error: 'Admin is forbidden'});
	}

	let newEnrollment = new Enrollment ({

		userId : req.user.id,
		enrolledCourses : req.body.enrolledCourses,
		totalPrice : req.body.totalPrice
	})

	return newEnrollment.save()
	.then(enrolled => {
		return res.status(201).send({message: 'Successfully Enrolled', enrolled});
	})
	.catch(findErr => {
        console.error("Error in enrolling: ", findErr)
        return res.status(500).send({ error: 'Error in enrolling'});
    })
}


module.exports.getEnrollments = (req, res) => {
    
		return Enrollment.find({userId : req.user.id})
		.then(enrollments => {
			if (enrollments.length > 0) {
				return res.status(200).send({ enrollments });
			}
			return res.status(404).send({ error: 'User not found'});
		})
      .catch(findErr => {
        console.error("User not found: ", findErr)
        return res.status(500).send({ error: 'Failed to fetch enrollments'});
    })
};


module.exports.resetPassword = async (req, res) => {
    
  try {
  	const { newPassword } = req.body;
  	const { id } = req.user; // Assuming the user id is extracted from the JWT token
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports.updateProfile = async (req, res) => {
  
      const { firstName, lastName, mobileNo } = req.body;
      const userId = req.user.id; // Assuming the user id is extracted from the JWT token
  
  try {
    // Update user's profile information in the database
    const updatedUser = await User.findByIdAndUpdate(userId, 
        { firstName, lastName, mobileNo }, 
        {new: true}
    );

    if(!updatedUser){
        return res.status(404).json({message: 'User not found'});
    }

    res.status(200).json({ message: 'Profile updated successfully',  user: updatedUser });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
};
module.exports.updateAdmin = async (req, res) => {
  
      const { userId } = req.body;
  
  try {
        // Find the user by id
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user as admin
        user.isAdmin = true;
        await user.save();

        return res.status(200).json({ message: 'User updated as admin successfully' });
    } catch (error) {
        console.error('Error updating user as admin:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.updateEnrollmentStatus = async (req, res) => {
    const { userId, courseId, status } = req.body;

    try {
        // Update the enrollment status
        const updatedEnrollment = await Enrollment.findOneAndUpdate(
            { userId, 'enrolledCourses.courseId': courseId },
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedEnrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        res.status(200).json({ message: 'Enrollment status updated successfully', enrollment: updatedEnrollment });
    } catch (error) {
        console.error('Error updating enrollment status:', error);
        res.status(500).json({ error: 'Failed to update enrollment status' });
    }
};