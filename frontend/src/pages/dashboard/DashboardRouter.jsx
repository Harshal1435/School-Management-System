import { useAuth } from '../../context/AuthContext';
import AdminDashboard from '../admin/AdminDashboard';
import TeacherDashboard from '../teacher/TeacherDashboard';
import StudentDashboard from '../student/StudentDashboard';
import ParentDashboard from '../parent/ParentDashboard';
import AccountantDashboard from '../accountant/AccountantDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':       return <AdminDashboard />;
    case 'teacher':     return <TeacherDashboard />;
    case 'student':     return <StudentDashboard />;
    case 'parent':      return <ParentDashboard />;
    case 'accountant':  return <AccountantDashboard />;
    default:
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          Unknown role. Please contact admin.
        </div>
      );
  }
};

export default DashboardRouter;
