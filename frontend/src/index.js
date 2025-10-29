import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./App";
import Login from './Components/AuthComponent/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdministratorDashboard from './pages/administrator/AdministratorDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import Report from './Components/Reports/report';
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Login /> },
      { path: "/student-dashboard", element: <StudentDashboard /> },
      { path: "/teacher-dashboard", element: <TeacherDashboard /> },
      { path: "/company-dashboard", element: <CompanyDashboard /> },
      { path: "/admin-dashboard", element: <AdministratorDashboard /> },
      { path: "/archieved-reports", element: <Report /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);