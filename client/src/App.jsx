import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentProfile from "./pages/StudentProfile";
import MentorProfile from "./pages/MentorProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/register" replace />}
        />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/student-profile"
          element={<StudentProfile />}
        />

        <Route
          path="/mentor-profile"
          element={<MentorProfile />}
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;