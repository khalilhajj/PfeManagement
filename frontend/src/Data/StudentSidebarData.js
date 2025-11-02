// SidebarData.js
import React from "react";
import * as AiIcons from "react-icons/ai";

export const StudentSidebarData = [
    {
        title: "Dashboard",
        path: "/student-dashboard",
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
];