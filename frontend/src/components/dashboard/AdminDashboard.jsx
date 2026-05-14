import { useState, useEffect } from 'react';
import { userAPI, courseAPI, assignmentAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalAssignments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, coursesRes, assignmentsRes] = await Promise.all([
        userAPI.getUsers(),
        courseAPI.getCourses(),
        assignmentAPI.getAssignments()
      ]);

      const students = usersRes.data.filter(u => u.role === 'student').length;
      const teachers = usersRes.data.filter(u => u.role === 'teacher').length;

      setStats({
        totalUsers: usersRes.data.length,
        totalStudents: students,
        totalTeachers: teachers,
        totalCourses: coursesRes.data.length,
        totalAssignments: assignmentsRes.data.length
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
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Students</h3>
          <p className="text-4xl font-bold">{stats.totalStudents}</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Teachers</h3>
          <p className="text-4xl font-bold">{stats.totalTeachers}</p>
        </div>
        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Courses</h3>
          <p className="text-4xl font-bold">{stats.totalCourses}</p>
        </div>
        <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Assignments</h3>
          <p className="text-4xl font-bold">{stats.totalAssignments}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">System Overview</h2>
        <p className="text-gray-600">Welcome to the admin panel. Monitor and manage all system activities from here.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;