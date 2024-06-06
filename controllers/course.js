const Course = require("../models/Course");
const Enrollment = require('../models/Enrollment');
const User = require("../models/User");

//[Section] Use Promise.catch()
/*
- Promise-based methods return "Promises" which can be chained with a .catch() method to handle any errors that occur during execution. This method allows you to handle errors in a more declarative way and can make your code more readable.
- Using .catch() is considered a best practice for handling errors within JavaScript Promise blocks. (A Promise in JavaScript represents the eventual completion or failure of an asynchronous operation along with its resulting value.)
- Because .then() operates asynchronously, we utilize .catch() exclusively to handle any errors that may arise from promise resolution.
*/


module.exports.addCourse = (req, res) => {

    const newCourse = new Course({
            name : req.body.name,
            description : req.body.description,
            price : req.body.price
            });

    Course.findOne({name: req.body.name})
    .then(existingCourse => {

        if (existingCourse) {
            return res.status(409).send({ error: 'Course already exists'})
        } 

        return newCourse.save()
        .then(savedCourse => {
            return res.status(201).send({ savedCourse })
        
        })

        .catch(saveErr => {
            console.error("Error in saving the course: ", saveErr)
            return res.status(500).send({ error: 'Failed to save the course'});
        })
    
    }) 

    .catch (findErr => {
        console.error("Error in finding the course: ", findErr)
        return res.status(500).send({ error: 'Error finding the course'})
    })
};


module.exports.getAllCourses = (req, res) => {
    return Course.find({}).then(courses => {
        if(courses.length > 0){
            return res.status(200).send({ courses });
        }
        else{
            
            return res.status(200).send({ message: 'No courses found.' });
        }
    })
    .catch(err => {
    console.error("Error in finding the course: ", err)
        return res.status(500).send({ error: 'Error finding all course'})
    });
};



module.exports.getAllActive = (req, res) => {
    
    Course.find({isActive: true})
    .then(courses => {
        if (courses.length > 0) {
            return res.status(200).send({ courses });
        } else {
            return res.status(200).send({ message: 'No active courses found.'})
        }
    })
    .catch(err => {
    console.error("Error in finding the course: ", err)
        return res.status(500).send({ error: 'Error finding active course'})
    });
};


module.exports.getCourse = (req, res) => {
    Course.findById(req.params.courseId)
        .then(course => {
            if (course) {
                return res.status(200).send({ course });
            } else {
                return res.status(404).send({ error: 'Course not found' });
            }
        })
        .catch(err => {
            console.error("Error fetching course: ", err);
            return res.status(500).send({ error: 'Failed to fetch course' });
        });
};

module.exports.updateCourse = (req, res) => {

    const courseId = req.params.courseId

    const updatedCourse = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Course.findByIdAndUpdate (courseId, updatedCourse)
    .then(updatedCourse => {
        if (!updatedCourse) {
            return res.status(404).send({ error: 'Course not found'});
        } else {
            return res.status(200).send({
                message: 'Course updated successfully',
                updatedCourse: updatedCourse
            });
        }
    })
    .catch (err => {
        console.error("Error in updating course: ", err)
        return res.status(500).send({ error: 'Error updating a course'})
    });
}


module.exports.archiveCourse = (req, res) => {
    const courseId = req.params.courseId;
    const archiveCourse = { isActive: false };

    Course.findByIdAndUpdate(courseId, archiveCourse)
        .then(course => {
            if (course) {
                return res.status(200).send({ archiveCourse: course, message: 'Course archived successfully' });
            } else {
                return res.status(404).send({ error: 'Course not found' });
            }
        })
        .catch(err => {
            console.error("Error archiving course: ", err);
            return res.status(500).send({ error: 'Failed to archive course' });
        });
};

module.exports.activateCourse = (req, res) => {
    const courseId = req.params.courseId;
    const activateCourse = { isActive: true };

    Course.findByIdAndUpdate(courseId, activateCourse)
        .then(course => {
            if (course) {
                return res.status(200).send({ activateCourse: course, message: 'Course activated successfully' });
            } else {
                return res.status(404).send({ error: 'Course not found' });
            }
        })
        .catch(err => {
            console.error("Error activating course: ", err);
            return res.status(500).send({ error: 'Failed to activate course' });
        });
};

module.exports.searchCoursesByName = async (req, res) => {
  const { courseName } = req.body;
  
  try {
    // Search for courses by course name
    const courses = await Course.find({ name: { $regex: courseName, $options: 'i' } });
    
    res.status(200).json( {courses} );
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mini Activity

module.exports.getEmailsOfEnrolledUsers = async (req, res) => {
              const courseId = req.params.courseId;

     try {
        // Find all enrollments for the given courseId
         const enrollments = await Enrollment.find({ 'enrolledCourses.courseId': courseId });

            if (!enrollments || enrollments.length === 0) {
                 return res.status(404).json({ message: 'No users enrolled in this course' });
               }

               // Get the userIds of enrolled users for the specific course
               const userIds = enrollments.map(enrollment => enrollment.userId);

               // Find the users with matching userIds
               const enrolledUsers = await User.find({ _id: { $in: userIds } });

               // Extract the emails from the enrolled users
               const userEmails = enrolledUsers.map(user => user.email);

               res.status(200).json({ userEmails });
        } catch (error) {
             console.log(error);
              res.status(500).json({ message: 'An error occurred while retrieving enrolled users' });
        }
};

module.exports.searchCoursesByPrice = async (req, res) => {
    let minPrice = req.body.minPrice;
    let maxPrice = req.body.maxPrice;

    minPrice = parseFloat(minPrice);
    maxPrice = parseFloat(maxPrice);

    try {

        if (isNaN(minPrice) || isNaN(maxPrice)) {
            return res.status(400).json({ error: 'Invalid price range' });
        }

        // Find courses within the given price range
        const courses = await Course.find({
            price: { $gte: minPrice, $lte: maxPrice }
        });

        if (courses.length > 0) {
            return res.status(200).json({ courses });
        } else {
            return res.status(200).json({ message: 'No courses found within the specified price range.' });
        }
    } catch (error) {
        console.error('Error finding courses by price range:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};