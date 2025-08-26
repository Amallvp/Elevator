import { Routes, Route } from "react-router-dom";
import AuthPage from "./auth/AuthPage";
import DashboardLayout from "./pages/DashboardLayout";
import PrivateRoute from "./config/PrivateRoute";


function App() {

  return (

      <Routes>
        {/* Public Auth Page */}
        <Route path="/" element={<AuthPage />} />

        {/* Protected Dashboard (with tab switching inside) */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />} />
        </Route>
      </Routes>
  );
}

export default App;
