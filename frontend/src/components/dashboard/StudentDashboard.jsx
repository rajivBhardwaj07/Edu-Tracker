import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { courseAPI, assignmentAPI, submissionAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    averageScore: 0
  });
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, assignmentsRes, submissionsRes, analyticsRes] = await Promise.all([
        courseAPI.getCourses(),
        assignmentAPI.getAssignments(),
        submissionAPI.getSubmissions(),
        submissionAPI.getStudentAnalytics()
      ]);

      const enrolledCourses = coursesRes.data.filter(c => 
        c.students.some(s => s._id === user._id)
      ).length;

      const pendingAssignments = assignmentsRes.data.length - submissionsRes.data.length;

      setStats({
        enrolledCourses,
        pendingAssignments,
        completedAssignments: submissionsRes.data.length,
        averageScore: analyticsRes.data.averagePercentage || 0
      });

      setAnalytics(analyticsRes.data);
      
      // Recent submissions
      const recent = submissionsRes.data.slice(0, 5).map(sub => ({
        title: sub.assignment?.title || 'Assignment',
        status: sub.status,
        date: new Date(sub.submittedAt).toLocaleDateString(),
        marks: sub.marksObtained
      }));
      setRecentActivity(recent);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const gradeDistribution = analytics?.submissions.reduce((acc, sub) => {
    const percentage = parseFloat(sub.percentage);
    if (percentage >= 90) acc.A++;
    else if (percentage >= 80) acc.B++;
    else if (percentage >= 70) acc.C++;
    else if (percentage >= 60) acc.D++;
    else acc.F++;
    return acc;
  }, { A: 0, B: 0, C: 0, D: 0, F: 0 }) || {};

  const pieData = Object.entries(gradeDistribution).map(([grade, count]) => ({
    name: grade,
    value: count
  })).filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
              <p className="text-blue-100 text-lg">Here's what's happening with your studies today</p>
            </div>
            <div className="bg-white/20 backdrop-blur-lg rounded-xl px-6 py-3">
              <p className="text-sm opacity-90">Current Semester</p>
              <p className="text-xl font-bold">Fall 2024</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 mb-1">Enrolled Courses</p>
                <h3 className="text-4xl font-bold">{stats.enrolledCourses}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <span className="text-3xl">📚</span>
              </div>
            </div>
            <div className="flex items-center text-blue-100 text-sm">
              <span className="mr-2">📈</span>
              <span>Active this semester</span>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-yellow-500 to-orange-500 text-white transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-yellow-100 mb-1">Pending Tasks</p>
                <h3 className="text-4xl font-bold">{stats.pendingAssignments}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <span className="text-3xl">⏰</span>
              </div>
            </div>
            <div className="flex items-center text-yellow-100 text-sm">
              <span className="mr-2">📝</span>
              <span>Assignments to complete</span>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-green-500 to-emerald-600 text-white transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-green-100 mb-1">Completed</p>
                <h3 className="text-4xl font-bold">{stats.completedAssignments}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <span className="text-3xl">✅</span>
              </div>
            </div>
            <div className="flex items-center text-green-100 text-sm">
              <span className="mr-2">🎯</span>
              <span>Submissions done</span>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-500 to-pink-500 text-white transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-purple-100 mb-1">Average Score</p>
                <h3 className="text-4xl font-bold">{stats.averageScore}%</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <span className="text-3xl">⭐</span>
              </div>
            </div>
            <div className="flex items-center text-purple-100 text-sm">
              <span className="mr-2">📊</span>
              <span>Overall performance</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {analytics && analytics.submissions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Bar Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Performance Overview</h2>
                <span className="text-3xl">📊</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.submissions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="title" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="percentage" fill="#3B82F6" name="Score %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Grade Distribution</h2>
                <span className="text-3xl">🎯</span>
              </div>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p>No grade data available yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 card-hover">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
              <span className="text-3xl">📋</span>
            </div>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        activity.status === 'graded' ? 'bg-green-100' :
                        activity.status === 'submitted' ? 'bg-blue-100' : 'bg-yellow-100'
                      }`}>
                        {activity.status === 'graded' ? '✅' : '📝'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                        <p className="text-sm text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                    {activity.marks !== null && (
                      <div className="text-right">
                        <span className="badge badge-success text-lg font-bold">
                          {activity.marks} pts
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl">No recent activity</p>
                <p className="text-sm mt-2">Start submitting assignments to see your activity</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
              <span className="text-3xl">⚡</span>
            </div>
            <div className="space-y-3">
              <a href="/courses" className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105 shadow-md text-center font-semibold">
                <span className="mr-2">📚</span>
                Browse Courses
              </a>
              <a href="/assignments" className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 shadow-md text-center font-semibold">
                <span className="mr-2">📝</span>
                View Assignments
              </a>
              <a href="/profile" className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition transform hover:scale-105 shadow-md text-center font-semibold">
                <span className="mr-2">👤</span>
                Edit Profile
              </a>
            </div>

            {/* Progress Ring */}
            <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">Semester Progress</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle cx="64" cy="64" r="60" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="60" 
                      stroke="#3B82F6" 
                      strokeWidth="8" 
                      fill="none"
                      strokeDasharray={`${(stats.completedAssignments / (stats.completedAssignments + stats.pendingAssignments)) * 377} 377`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">
                      {stats.completedAssignments + stats.pendingAssignments > 0 
                        ? Math.round((stats.completedAssignments / (stats.completedAssignments + stats.pendingAssignments)) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-center mt-4 text-sm text-gray-600">
                {stats.completedAssignments} of {stats.completedAssignments + stats.pendingAssignments} completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;