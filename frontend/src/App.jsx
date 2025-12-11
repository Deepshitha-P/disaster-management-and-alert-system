import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserDashboard from "./pages/dashboards/UserDashboard"; 
import VolunteerDashboard from "./pages/dashboards/VolunteerDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard"; // 👈 create this


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        
        {/* fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
