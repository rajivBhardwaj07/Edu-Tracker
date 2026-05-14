import { useState, useEffect } from 'react';
import { assignmentAPI, courseAPI, submissionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssignmentCard from '../components/Assignments/AssignmentCard';
import AssignmentForm from '../components/Assignments/AssignmentForm';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        assignmentAPI.getAssignments(),
        submissionAPI.getSubmissions()
      ]);
      setAssignments(assignmentsRes.data);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentCreated = () => {
    setShowForm(false);
    fetchData();
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Assignments</h1>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : 'Create Assignment'}
          </button>
        )}
      </div>

      {showForm && <AssignmentForm onSuccess={handleAssignmentCreated} />}

      {assignments.length === 0 ? (
        <div className="text-center text-gray-600 mt-8">
          <p className="text-xl">No assignments available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const submission = submissions.find(s => s.assignment._id === assignment._id);
            return (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                submission={submission}
                onUpdate={fetchData}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Assignments;