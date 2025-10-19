import './App.css';
import Login from './Components/AuthComponent/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdministratorDashboard from './pages/administrator/AdministratorDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/admin-dashboard" element={<AdministratorDashboard />} />
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
