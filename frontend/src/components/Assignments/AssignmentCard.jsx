import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assignmentAPI } from '../../services/api';
import SubmissionForm from './SubmissionForm';

const AssignmentCard = ({ assignment, submission, onUpdate }) => {
  const { user } = useAuth();
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const isOverdue = new Date() > new Date(assignment.dueDate);
  const hasSubmitted = !!submission; 

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentAPI.deleteAssignment(assignment._id);
        alert('Assignment deleted!');
        onUpdate();
      } catch (error) {
        alert(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleSubmitSuccess = () => {
    setShowSubmitForm(false);
    onUpdate();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">{assignment.title}</h3>
          <p className="text-gray-600 mb-2">{assignment.description}</p>
        </div>
        <div className="text-right">
          {hasSubmitted ? (
            <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded">
              Submitted
            </span>
          ) : isOverdue ? (
            <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded">
              Overdue
            </span>
          ) : (
            <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded">
              Pending
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Course</p>
          <p className="font-semibold">{assignment.course.title}</p>
        </div>
        <div>
          <p className="text-gray-600">Total Marks</p>
          <p className="font-semibold">{assignment.totalMarks}</p>
        </div>
        <div>
          <p className="text-gray-600">Due Date</p>
          <p className="font-semibold">
            {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Teacher</p>
          <p className="font-semibold">{assignment.teacher.name}</p>
        </div>
      </div>

      {submission && (
        <div className="bg-gray-50 p-4 rounded mb-4">
          <h4 className="font-semibold mb-2">Your Submission</h4>
          <p className="text-sm text-gray-600 mb-2">{submission.content}</p>
          {submission.status === 'graded' && (
            <div className="text-sm">
              <p><strong>Marks:</strong> {submission.marksObtained}/{assignment.totalMarks}</p>
              <p><strong>Percentage:</strong> {submission.percentage}%</p>
              {submission.feedback && <p><strong>Feedback:</strong> {submission.feedback}</p>}
            </div>
          )}
        </div>
      )}

      {user?.role === 'student' && !hasSubmitted && !showSubmitForm && (
        <button
          onClick={() => setShowSubmitForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Submit Assignment
        </button>
      )}

      {showSubmitForm && (
        <SubmissionForm
          assignmentId={assignment._id}
          onSuccess={handleSubmitSuccess}
          onCancel={() => setShowSubmitForm(false)}
        />
      )}

      {(user?.role === 'teacher' || user?.role === 'admin') && (
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
        >
          Delete Assignment
        </button>
      )}
    </div>
  );
};

export default AssignmentCard;