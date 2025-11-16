// SidebarData.js
import React from "react";
import * as AiIcons from "react-icons/ai";

export const AdminSidebarData = [
  {
    title: "Dashboard",
    path: "/teacher-dashboard",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "Archieved Reports",
    path: "/archieved-reports",
    icon: <AiIcons.AiFillEdit />,
    cName: "nav-text",
  },
  {
    title: "Profile",
    path: "/profile",
    icon: <AiIcons.AiOutlineUser />,
    cName: "nav-text",
  },
  {
    title: "Pending Internships",
    path: "/pending-internships",
    icon: <AiIcons.AiOutlineLoading />,
    cName: "nav-text",
  },
  {
    title: "User Management",
    path: "/user-management",
    icon: <AiIcons.AiOutlineUserSwitch />,
    cName: "nav-text",
  },
];
