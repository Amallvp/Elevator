import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const token = localStorage.getItem("adminToken");
  return token ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;