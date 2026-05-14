import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === 'student' && <StudentDashboard />}
      {user?.role === 'teacher' && <TeacherDashboard />}
      {user?.role === 'admin' && <AdminDashboard />}
    </div>
  );
};

export default Dashboard;