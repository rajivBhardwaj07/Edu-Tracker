import { useState, useEffect } from 'react';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/courses/CourseCard';
import CourseForm from '../components/courses/CourseForm';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, enrolled, available

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, filterType, user]);

  const fetchCourses = async () => {
    try {
      const { data } = await courseAPI.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by enrollment status
    if (filterType === 'enrolled') {
      filtered = filtered.filter(course =>
        course.students.some(s => s._id === user?._id)
      );
    } else if (filterType === 'available') {
      filtered = filtered.filter(course =>
        !course.students.some(s => s._id === user?._id)
      );
    }

    setFilteredCourses(filtered);
  };

  const handleCourseCreated = () => {
    setShowForm(false);
    fetchCourses();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Courses</h1>
              <p className="text-gray-600">Explore and enroll in available courses</p>
            </div>
            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <span className="text-xl">{showForm ? '✖️' : '➕'}</span>
                <span>{showForm ? 'Cancel' : 'Create Course'}</span>
              </button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by course name, code, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Filter */}
              {user?.role === 'student' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      filterType === 'all'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Courses
                  </button>
                  <button
                    onClick={() => setFilterType('enrolled')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      filterType === 'enrolled'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    My Courses
                  </button>
                  <button
                    onClick={() => setFilterType('available')}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      filterType === 'available'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Available
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Form */}
        {showForm && (
          <div className="mb-8 animate-fadeIn">
            <CourseForm onSuccess={handleCourseCreated} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Total Courses</p>
                <p className="text-4xl font-bold">{courses.length}</p>
              </div>
              <span className="text-5xl opacity-50">📚</span>
            </div>
          </div>
          {user?.role === 'student' && (
            <>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 mb-1">Enrolled</p>
                    <p className="text-4xl font-bold">
                      {courses.filter(c => c.students.some(s => s._id === user._id)).length}
                    </p>
                  </div>
                  <span className="text-5xl opacity-50">✅</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 mb-1">Available</p>
                    <p className="text-4xl font-bold">
                      {courses.filter(c => !c.students.some(s => s._id === user._id)).length}
                    </p>
                  </div>
                  <span className="text-5xl opacity-50">🎯</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'No courses available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} onUpdate={fetchCourses} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;