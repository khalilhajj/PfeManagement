import React, { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { StudentSidebarData } from "../../Data/StudentSidebarData";
import { TeacherSidebarData } from "../../Data/TeacherSidebarData";
import { AdminSidebarData } from "../../Data/AdminSidebarData";
import "../../App.css";
import { IconContext } from "react-icons";
import "./navbar.css";
import { jwtDecode } from "jwt-decode";
import { Dropdown } from "react-bootstrap";

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navigate = useNavigate();

  const showSidebar = () => setSidebar(!sidebar);

  const token = localStorage.getItem("accessToken");
  let decodedToken = null;

  if (token) {
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  } else {
    navigate("/login");
  }
  if (!decodedToken) return null;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };
  return (
    <>
      <IconContext.Provider value={{ color: "undefined" }}>
        <div className="navbar">
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars onClick={showSidebar} />
          </Link>
          <div className="navbar-right">
            <div className="notification-icon">
              <AiIcons.AiFillBell />
              <span className="notification-badge">3</span>
            </div>

            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                id="user-dropdown"
                className="user-dropdown-toggle"
              >
                <span className="user-name">
                  Hello, {decodedToken.username || "User"}
                </span>
                <AiIcons.AiOutlineDown className="dropdown-arrow-icon" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="user-dropdown-menu">
                <Dropdown.Item onClick={handleLogout} id="logout-button" className="logout-item">
                  <AiIcons.AiOutlineLogout className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
          <ul className="nav-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose />
              </Link>
            </li>

            {decodedToken.role_name === "Student" &&
              StudentSidebarData.map((item, index) => (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            {decodedToken.role_name === "Teacher" &&
              TeacherSidebarData.map((item, index) => (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            {decodedToken.role_name === "Administrator" &&
              AdminSidebarData.map((item, index) => (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
