import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// User APIs
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role })
};

// Course APIs
export const courseAPI = {
  getCourses: () => api.get('/courses'),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  unenrollCourse: (id) => api.post(`/courses/${id}/unenroll`)
};

// Assignment APIs
export const assignmentAPI = {
  getAssignments: (courseId) => api.get(`/assignments${courseId ? `?courseId=${courseId}` : ''}`),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (data) => api.post('/assignments', data),
  updateAssignment: (id, data) => api.put(`/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`)
};

// Submission APIs
export const submissionAPI = {
  getSubmissions: (assignmentId) => api.get(`/submissions${assignmentId ? `?assignmentId=${assignmentId}` : ''}`),
  getSubmission: (id) => api.get(`/submissions/${id}`),
  createSubmission: (data) => api.post('/submissions', data),
  updateSubmission: (id, data) => api.put(`/submissions/${id}`, data),
  gradeSubmission: (id, data) => api.put(`/submissions/${id}/grade`, data),
  deleteSubmission: (id) => api.delete(`/submissions/${id}`),
  getStudentAnalytics: () => api.get('/submissions/analytics/student')
};

export default api;