import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminStudentsPage from './pages/admin/AdminStudentsPage.jsx';
import AdminSubjectsPage from './pages/admin/AdminSubjectsPage.jsx';
import AdminTeachersPage from './pages/admin/AdminTeachersPage.jsx';
import ScanAttendancePage from './pages/student/ScanAttendancePage.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentHistoryPage from './pages/student/StudentHistoryPage.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import TeacherReportsPage from './pages/teacher/TeacherReportsPage.jsx';
import TeacherSessionPage from './pages/teacher/TeacherSessionPage.jsx';

const studentLinks = [
  { to: '/student', label: 'Dashboard', end: true },
  { to: '/student/scan', label: 'Scan QR' },
  { to: '/student/history', label: 'History' },
];

const teacherLinks = [
  { to: '/teacher', label: 'Dashboard', end: true },
  { to: '/teacher/session', label: 'Session & QR' },
  { to: '/teacher/reports', label: 'Reports' },
];

const adminLinks = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/teachers', label: 'Teachers' },
  { to: '/admin/subjects', label: 'Subjects & Classes' },
];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route
              path="/student"
              element={<DashboardLayout title="Student Portal" links={studentLinks} />}
            >
              <Route index element={<StudentDashboard />} />
              <Route path="scan" element={<ScanAttendancePage />} />
              <Route path="history" element={<StudentHistoryPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['teacher']} />}>
            <Route
              path="/teacher"
              element={<DashboardLayout title="Teacher Portal" links={teacherLinks} />}
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="session" element={<TeacherSessionPage />} />
              <Route path="reports" element={<TeacherReportsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route
              path="/admin"
              element={<DashboardLayout title="Admin Portal" links={adminLinks} />}
            >
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="teachers" element={<AdminTeachersPage />} />
              <Route path="subjects" element={<AdminSubjectsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
