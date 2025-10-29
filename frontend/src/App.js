import './App.css';
import Navbar from './Components/SideBar/navbar';
import { Outlet } from "react-router-dom";

const AppLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

export default AppLayout;