import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./App";
import Login from './Components/AuthComponent/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdministratorDashboard from './pages/administrator/AdministratorDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import Report from './Components/Reports/report';
import ProtectedRoute from './Components/AuthComponent/ProtectedRoute';
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Login /> },
      {
        element: <ProtectedRoute allowedRoles={['Student']} />,
        children: [
          { path: "/student-dashboard", element: <StudentDashboard /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['Teacher']} />,
        children: [
          { path: "/teacher-dashboard", element: <TeacherDashboard /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['Company']} />,
        children: [
          { path: "/company-dashboard", element: <CompanyDashboard /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['Administrator']} />,
        children: [
          { path: "/admin-dashboard", element: <AdministratorDashboard /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['Administrator', 'Teacher','Student']} />,
        children: [
          { path: "/archieved-reports", element: <Report /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);