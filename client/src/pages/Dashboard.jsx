
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // ==================================
  // FETCH LOGGED-IN USER PROFILE
  // ==================================

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem("mentora_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await axiosClient.get("/auth/me");

        setUser(response.data.user);

      } catch (err) {
        console.error("Dashboard Error:", err);

        setError("Unable to load profile. Please login again.");

        sessionStorage.removeItem("mentora_token");
      }
    };

    fetchProfile();
  }, [navigate]);

  // ==================================
  // LOGOUT FUNCTION
  // ==================================

  const handleLogout = () => {
    sessionStorage.removeItem("mentora_token");
    navigate("/login", { replace: true });
  };

  // ==================================
  // ERROR MESSAGE
  // ==================================

  if (error) {
    return (
      <div className="auth-card">
        <p className="error">{error}</p>

        <button onClick={handleLogout}>
          Go to Login
        </button>
      </div>
    );
  }

  // ==================================
  // LOADING STATE
  // ==================================

  if (!user) {
    return (
      <p className="loading-message">
        Loading profile...
      </p>
    );
  }

  // ==================================
  // CHECK USER ROLE
  // ==================================

  const isJuniorStudent = user.role === "Junior Student";

  const isMentor = [
    "Senior Student",
    "Alumni",
    "Industry Expert"
  ].includes(user.role);

  const isAdmin = user.role === "Admin";

  // ==================================
  // DASHBOARD
  // ==================================

  return (
    <div className="auth-card">

      <h1>Mentora Dashboard</h1>

      <h2>Welcome, {user.name}!</h2>

      <p>
        <strong>Email:</strong> {user.email}
      </p>

      <p>
        <strong>Role:</strong> {user.role}
      </p>

      <p>
        <strong>Department:</strong> {user.department}
      </p>

      <p>
        <strong>Verification:</strong>{" "}
        {user.verified ? "Verified" : "Not Verified"}
      </p>

      {/* ==================================
          JUNIOR STUDENT PROFILE
      ================================== */}

      {isJuniorStudent && (
        <button
          type="button"
          onClick={() => navigate("/student-profile")}
        >
          Edit Student Profile
        </button>
      )}

      {/* ==================================
          MENTOR PROFILE
      ================================== */}

      {isMentor && (
        <button
          type="button"
          onClick={() => navigate("/mentor-profile")}
        >
          Edit Mentor Profile
        </button>
      )}

      {/* ==================================
          ADMIN DASHBOARD
          Future implementation
      ================================== */}

      {isAdmin && (
        <p>
          Admin account detected.
          Verification management will be available soon.
        </p>
      )}

      {/* ==================================
          LOGOUT BUTTON
      ================================== */}

      <button
        type="button"
        onClick={handleLogout}
      >
        Logout
      </button>

    </div>
  );
}

export default Dashboard;
