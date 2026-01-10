// SidebarData.js
import React from "react";
import * as AiIcons from "react-icons/ai";

export const CompanySidebarData = [
  {
    title: "Dashboard",
    path: "/company-dashboard",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "Post Internship",
    path: "/company/post-internship",
    icon: <AiIcons.AiOutlinePlusCircle />,
    cName: "nav-text",
  },
  {
    title: "Applications",
    path: "/company/applications",
    icon: <AiIcons.AiOutlineFileSearch />,
    cName: "nav-text",
  },
  {
    title: "Profile",
    path: "/profile",
    icon: <AiIcons.AiOutlineUser />,
    cName: "nav-text",
  },
];
