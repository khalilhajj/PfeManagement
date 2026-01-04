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
import { Dropdown, Badge } from "react-bootstrap";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../api";

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
  // WebSocket Connection
  useEffect(() => {
    if (!decodedToken) return;

    let socket;
    let reconnectTimeout;

    const connectWebSocket = () => {
        const token = localStorage.getItem('accessToken');
        if (!token || token === "null" || token === "undefined") {
            console.log("No valid access token found for WebSocket");
            return;
        }

        // Use wss if https, ws if http
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/notifications/?token=${token}`;
        
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("WebSocket Connected");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message) {
                // Fetch latest notifications to stay in sync
                getNotifications().then(data => {
                    setNotifications(data);
                    setUnreadCount(data.filter(n => !n.is_read).length);
                });
            }
        };

        socket.onclose = () => {
            console.log("WebSocket Disconnected. Reconnecting...");
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
            socket.close();
        };
    };

    // Initial fetch
    getNotifications().then(data => {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
    });

    connectWebSocket();

    return () => {
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (socket) {
            socket.onclose = null; // Prevent reconnection trigger
            socket.close();
        }
    };
  }, [token]);

  if (!decodedToken) return null;

  const handleMarkAsRead = async (id) => {
      try {
          await markNotificationRead(id);
          // Optimistic update
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
          setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
          console.error(err);
      }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
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
              <Dropdown align="end">
                  <Dropdown.Toggle variant="link" id="notification-dropdown" className="text-white">
                      <AiIcons.AiFillBell size={24} />
                      {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ maxHeight: '300px', overflowY: 'auto', minWidth: '300px' }}>
                      <Dropdown.Header>Notifications</Dropdown.Header>
                      {notifications.length === 0 ? (
                          <Dropdown.Item>No notifications</Dropdown.Item>
                      ) : (
                          notifications.map(n => (
                              <Dropdown.Item 
                                  key={n.id} 
                                  onClick={() => handleMarkAsRead(n.id)}
                                  style={{ backgroundColor: n.is_read ? 'white' : '#f0f2f5', whiteSpace: 'normal' }}
                              >
                                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                      {new Date(n.created_at).toLocaleString()}
                                  </small>
                                  <div>{n.message}</div>
                              </Dropdown.Item>
                          ))
                      )}
                  </Dropdown.Menu>
              </Dropdown>
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
