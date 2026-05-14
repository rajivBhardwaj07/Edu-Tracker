import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  code: {
    type: String,
    required: [true, 'Please add a course code'],
    unique: true,
    uppercase: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  semester: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  maxStudents: {
    type: Number,
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  schedule: {
    days: [String],
    time: String
  }
}, {
  timestamps: true
});

// Virtual for enrolled count
courseSchema.virtual('enrolledCount').get(function() {
  return this.students.length;
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

const Course = mongoose.model('Course', courseSchema);

export default Course;