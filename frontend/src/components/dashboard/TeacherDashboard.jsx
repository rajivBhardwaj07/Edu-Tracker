import { useState, useEffect } from 'react';
import { courseAPI, assignmentAPI, submissionAPI } from '../../services/api';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    pendingGrading: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, assignmentsRes, submissionsRes] = await Promise.all([
        courseAPI.getCourses(),
        assignmentAPI.getAssignments(),
        submissionAPI.getSubmissions()
      ]);

      const totalStudents = coursesRes.data.reduce((sum, course) => 
        sum + course.students.length, 0
      );

      const pendingGrading = submissionsRes.data.filter(
        s => s.status === 'submitted'
      ).length;

      setStats({
        totalCourses: coursesRes.data.length,
        totalStudents,
        totalAssignments: assignmentsRes.data.length,
        pendingGrading
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">My Courses</h3>
          <p className="text-4xl font-bold">{stats.totalCourses}</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Students</h3>
          <p className="text-4xl font-bold">{stats.totalStudents}</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Assignments</h3>
          <p className="text-4xl font-bold">{stats.totalAssignments}</p>
        </div>
        <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Pending Grading</h3>
          <p className="text-4xl font-bold">{stats.pendingGrading}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition">
              Create New Course
            </button>
            <button className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition">
              Create Assignment
            </button>
            <button className="w-full bg-purple-500 text-white py-3 rounded hover:bg-purple-600 transition">
              Grade Submissions
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;