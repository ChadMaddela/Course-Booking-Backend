const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
	userId: {
		type: String,
		required: [true, 'User ID is required']
	},
	enrolledCourses: [
		{
			courseId: {
				type: String,
				required: [true, 'Course ID is required']
			}
		}
	],
	totalPrice: {
		type: Number,
		required: [true, 'Total Price is required']
	},
	enrolledOn: {
		type: Date,
		default: Date.now
	},
	status: {
		type: String,
		default: 'Enrolled'
	}

});

module.exports = mongoose.model('Enrollment', enrollmentSchema);