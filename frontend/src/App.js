import './App.css';
import Navbar from './Components/SideBar/navbar';
import { Outlet,useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AppLayout = () => {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  let isAuthenticated = false;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 > Date.now()) {
        isAuthenticated = true;
      } else {
        localStorage.clear();
      }
    } catch (err) {
      localStorage.clear();
    }
  }
  const hideNavbar = !isAuthenticated || location.pathname === "/";
  return  (
  
  <>
      {!hideNavbar && <Navbar />}
      <Outlet />
  </>
)};

export default AppLayout;