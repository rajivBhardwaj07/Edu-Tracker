import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      delete updateData.confirmPassword;

      await userAPI.updateProfile(updateData);
      setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
      setIsEditing(false);
      
      const { data } = await authAPI.getMe();
      localStorage.setItem('user', JSON.stringify(data));
      
      // Clear password fields
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || '❌ Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'student': return 'from-blue-500 to-blue-600';
      case 'teacher': return 'from-green-500 to-green-600';
      case 'admin': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'student': return '🎓';
      case 'teacher': return '👨‍🏫';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">👤 My Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
                <div className={`bg-gradient-to-br ${getRoleColor(user?.role)} p-8 text-white text-center`}>
                  <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center text-6xl mb-4 shadow-lg">
                    {getRoleIcon(user?.role)}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
                  <p className="text-sm opacity-90 mb-4">{user?.email}</p>
                  <span className="inline-block bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full text-sm font-bold">
                    {user?.role?.toUpperCase()}
                  </span>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 text-sm">Department</span>
                      <span className="font-semibold text-gray-800">
                        {user?.department || 'Not set'}
                      </span>
                    </div>
                    {user?.studentId && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 text-sm">Student ID</span>
                        <span className="font-semibold text-gray-800">
                          {user.studentId}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 text-sm">Phone</span>
                      <span className="font-semibold text-gray-800">
                        {user?.phone || 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 text-sm">Member Since</span>
                      <span className="font-semibold text-gray-800">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Profile Settings</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center space-x-2"
                    >
                      <span>✏️</span>
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                {message.text && (
                  <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                    message.type === 'success' 
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-red-50 border-red-500 text-red-700'
                  } animate-fadeIn`}>
                    <p className="font-medium">{message.text}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                          👤
                        </span>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition disabled:bg-gray-50 disabled:text-gray-600"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                          📧
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition disabled:bg-gray-50 disabled:text-gray-600"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                          📱
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Department
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                          🏛️
                        </span>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <>
                        <hr className="my-6" />
                        <h4 className="text-lg font-bold text-gray-800 mb-4">
                          Change Password (Optional)
                        </h4>

                        {/* New Password */}
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                              🔒
                            </span>
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                              placeholder="Leave blank to keep current password"
                              minLength="6"
                            />
                          </div>
                        </div>

                        {/* Confirm Password */}
                        {formData.password && (
                          <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                                🔐
                              </span>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                                placeholder="Confirm your new password"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex space-x-4 pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center">
                              <div className="spinner border-white mr-3"></div>
                              Updating...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <span className="mr-2">💾</span>
                              Save Changes
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setMessage({ type: '', text: '' });
                            setFormData({
                              name: user?.name || '',
                              email: user?.email || '',
                              phone: user?.phone || '',
                              department: user?.department || '',
                              password: '',
                              confirmPassword: ''
                            });
                          }}
                          className="px-8 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;