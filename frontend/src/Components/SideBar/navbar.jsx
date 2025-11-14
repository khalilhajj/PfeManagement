import React, { useState, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { StudentSidebarData } from "../../Data/StudentSidebarData";
import "../../App.css";
import { IconContext } from "react-icons";
import './navbar.css';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
    const [sidebar, setSidebar] = useState(true);
    const navigate = useNavigate();

    const showSidebar = () => setSidebar(!sidebar);

    const token = localStorage.getItem('accessToken');
    let decodedToken = null;

    if (token) {
        try {
            decodedToken = jwtDecode(token);
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem('accessToken'); 
            navigate("/login");  // optional
        }
    } else {
        navigate("/login");
    }

    // Still nothing? Don't render to avoid crashes
    if (!decodedToken) return null;

    return (
        <>
            <IconContext.Provider value={{ color: "undefined" }}>
                <div className="navbar">
                    <Link to="#" className="menu-bars">
                        <FaIcons.FaBars onClick={showSidebar} />
                    </Link>
                </div>

                <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
                    <ul className="nav-menu-items" onClick={showSidebar}>
                        <li className="navbar-toggle">
                            <Link to="#" className="menu-bars">
                                <AiIcons.AiOutlineClose />
                            </Link>
                        </li>

                        {/* Render based on role */}
                        {decodedToken.role_name === "Student" &&
                            StudentSidebarData.map((item, index) => (
                                <li key={index} className={item.cName}>
                                    <Link to={item.path}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </nav>
            </IconContext.Provider>
        </>
    );
}

export default Navbar;
