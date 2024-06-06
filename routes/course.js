const express = require('express');
const courseController = require('../controllers/course');
const {verify, verifyAdmin} = require("../auth");



const router = express.Router();


router.post("/", verify, verifyAdmin, courseController.addCourse);


router.get("/all", verify, verifyAdmin, courseController.getAllCourses);

router.get("/", courseController.getAllActive); 

router.get("/:courseId", courseController.getCourse);

// Update Course
router.patch("/:courseId", verify, verifyAdmin, courseController.updateCourse);


router.patch("/:courseId/archive", verify, verifyAdmin, courseController.archiveCourse);

router.patch("/:courseId/activate", verify, verifyAdmin, courseController.activateCourse);

router.post('/search', courseController.searchCoursesByName);

router.get('/:courseId/enrolled-users', courseController.getEmailsOfEnrolledUsers);

module.exports = router;

