// SidebarData.js
import React from "react";
import * as AiIcons from "react-icons/ai";

export const TeacherSidebarData = [
    {
        title: "Dashboard",
        path: "/teacher-dashboard",
        icon: <AiIcons.AiFillHome />,
        cName: "nav-text"
    },
    {
        title: "Archieved Reports",
        path: "/archieved-reports",
        icon: <AiIcons.AiFillEdit />,
        cName: "nav-text"
    },
    {
        title: "Profile",
        path: "/profile",
        icon: <AiIcons.AiOutlineUser />,
        cName: "nav-text"
    },
        {
        title: "Pending Invitations",
        path: "/pending-invitations",
        icon: <AiIcons.AiOutlineUser />,
        cName: "nav-text"
    },
];