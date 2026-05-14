import { useAuth } from '../../context/AuthContext';
import { courseAPI } from '../../services/api';

const CourseCard = ({ course, onUpdate }) => {
  const { user } = useAuth();
  const isEnrolled = course.students.some(s => s._id === user?._id);
  const isFull = course.students.length >= course.maxStudents;
  const enrollmentPercentage = (course.students.length / course.maxStudents) * 100;

  const handleEnroll = async () => {
    try {
      await courseAPI.enrollCourse(course._id);
      alert('✅ Successfully enrolled!');
      onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || '❌ Enrollment failed');
    }
  };

  const handleUnenroll = async () => {
    if (window.confirm('Are you sure you want to unenroll from this course?')) {
      try {
        await courseAPI.unenrollCourse(course._id);
        alert('✅ Successfully unenrolled!');
        onUpdate();
      } catch (error) {
        alert(error.response?.data?.message || '❌ Unenrollment failed');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('⚠️ Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await courseAPI.deleteCourse(course._id);
        alert('✅ Course deleted!');
        onUpdate();
      } catch (error) {
        alert(error.response?.data?.message || '❌ Delete failed');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover group">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-white/20 backdrop-blur-lg text-white text-xs font-bold px-3 py-1 rounded-full">
            {course.code}
          </span>
          {isEnrolled && (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
              <span className="mr-1">✅</span> Enrolled
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold mb-2 group-hover:scale-105 transition-transform">
          {course.title}
        </h3>
        <p className="text-blue-100 text-sm line-clamp-2">{course.description}</p>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Teacher</p>
            <p className="font-semibold text-gray-800 text-sm flex items-center">
              <span className="mr-1">👨‍🏫</span>
              {course.teacher.name}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Department</p>
            <p className="font-semibold text-gray-800 text-sm flex items-center">
              <span className="mr-1">🏛️</span>
              {course.department}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Semester</p>
            <p className="font-semibold text-gray-800 text-sm flex items-center">
              <span className="mr-1">📅</span>
              {course.semester}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Credits</p>
            <p className="font-semibold text-gray-800 text-sm flex items-center">
              <span className="mr-1">⭐</span>
              {course.credits}
            </p>
          </div>
        </div>

        {/* Enrollment Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Enrollment</span>
            <span className="text-sm font-bold text-gray-800">
              {course.students.length}/{course.maxStudents}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                enrollmentPercentage >= 90 ? 'bg-red-500' :
                enrollmentPercentage >= 70 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${enrollmentPercentage}%` }}
            ></div>
          </div>
          {isFull && (
            <p className="text-xs text-red-600 mt-1 font-semibold">⚠️ Course is full</p>
          )}
        </div>

        {/* Actions */}
        {user?.role === 'student' && (
          <div>
            {isEnrolled ? (
              <button
                onClick={handleUnenroll}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition transform hover:scale-105 shadow-md flex items-center justify-center space-x-2"
              >
                <span>❌</span>
                <span>Unenroll</span>
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={isFull}
                className={`w-full py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-md flex items-center justify-center space-x-2 ${
                  isFull
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                }`}
              >
                <span>{isFull ? '🚫' : '✅'}</span>
                <span>{isFull ? 'Course Full' : 'Enroll Now'}</span>
              </button>
            )}
          </div>
        )}

        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <div className="space-y-2">
            <button
              onClick={handleDelete}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition transform hover:scale-105 shadow-md flex items-center justify-center space-x-2"
            >
              <span>🗑️</span>
              <span>Delete Course</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;