import { Navigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Requests from "./pages/Requests";

const routes = [
  {
    path: "/",
    element: <Navigate to="/home" replace />
  },
  {
    path: "/home",
    element: <Home />
  },
  {
    path: "/about",
    element: <About />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/requests",
    element: <Requests />
  },

]

export default routes