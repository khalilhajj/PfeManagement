import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./App";
import Login from "./Components/AuthComponent/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import AdministratorDashboard from "./pages/administrator/AdministratorDashboard";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import Report from "./Components/Reports/report";
import ProtectedRoute from "./Components/AuthComponent/ProtectedRoute";
import Profile from "./pages/profile";
import "bootstrap/dist/css/bootstrap.min.css";
import PendingInternships from "./pages/administrator/PendingInternships";
import PendingInvitation from "./pages/teacher/PendingInvitation";
import UserManagement from "./pages/administrator/UserManagement";
import TeacherReportReview from "./pages/teacher/TeacherReportView";
import StudentReports from "./pages/student/StudentReports";
import ActivateAccount from "./Components/AuthComponent/ActivateAccount";
import SoutenancePlanning from "./pages/administrator/SoutenancePlanning";
import MySoutenance from "./pages/MySoutenance";
import CVAnalyzer from "./Components/CVAnalyzer/CVAnalyzer";
// Company pages
import PostInternship from "./pages/company/PostInternship";
import CompanyApplications from "./pages/company/CompanyApplications";
// Student browse internships
import BrowseInternships from "./pages/student/BrowseInternships";
import MyApplications from "./pages/student/MyApplications";
// Admin pending offers
import PendingOffers from "./pages/administrator/PendingOffers";
import RoomManagement from "./pages/administrator/RoomManagement";
import Statistics from "./pages/administrator/Statistics";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Login /> },
      {path: "/activate/:token", element: <ActivateAccount /> },
      {
        element: <ProtectedRoute allowedRoles={["Student"]} />,
        children: [
          { path: "/student-dashboard", element: <StudentDashboard /> },
          { path: "/browse-internships", element: <BrowseInternships /> },
          { path: "/my-applications", element: <MyApplications /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["Student"]} />,
        children: [
          { path: "/student/reports", element: <StudentReports /> },
          { path: "/my-soutenances", element: <MySoutenance /> },
          { path: "/cv-analyzer", element: <CVAnalyzer /> }
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["Teacher"]} />,
        children: [
          { path: "/teacher-dashboard", element: <TeacherDashboard /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["Teacher"]} />,
        children: [
          {
            path: "/teacher/pending-reviews",
            element: <TeacherReportReview />,
          },
          { path: "/teacher-soutenances", element: <MySoutenance /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["Teacher"]} />,
        children: [
          { path: "/pending-invitations", element: <PendingInvitation /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["Company"]} />,
        children: [
          { path: "/company-dashboard", element: <CompanyDashboard /> },
          { path: "/company/post-internship", element: <PostInternship /> },
          { path: "/company/applications", element: <CompanyApplications /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["Administrator"]} />,
        children: [
          { path: "/admin-dashboard", element: <AdministratorDashboard /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["Administrator"]} />,
        children: [
          { path: "/pending-internships", element: <PendingInternships /> },
          { path: "/pending-offers", element: <PendingOffers /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["Administrator"]} />,
        children: [{ path: "/user-management", element: <UserManagement /> }, { path: "/soutenance-planning", element: <SoutenancePlanning /> }, { path: "/room-management", element: <RoomManagement /> }, { path: "/statistics", element: <Statistics /> }],
      },
      {
        element: (
          <ProtectedRoute
            allowedRoles={["Administrator", "Teacher", "Student"]}
          />
        ),
        children: [{ path: "/archieved-reports", element: <Report /> }],
      },
      {
        element: (
          <ProtectedRoute
            allowedRoles={["Administrator", "Teacher", "Student", "Company"]}
          />
        ),
        children: [{ path: "/profile", element: <Profile /> }],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
