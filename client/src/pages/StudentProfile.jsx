
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function StudentProfile() {
  const navigate = useNavigate();

  // Form data
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [careerGoal, setCareerGoal] = useState("");

  // Page states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==================================
  // FETCH STUDENT PROFILE
  // ==================================

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      // Check JWT token
      const token = sessionStorage.getItem("mentora_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await axiosClient.get("/auth/me");

        if (!active) return;

        const user = response.data.user;

        // Only Junior Students can access this page
        if (user.role !== "Junior Student") {
          navigate("/dashboard", { replace: true });
          return;
        }

        // Load existing data
        setSkills(
          Array.isArray(user.skills)
            ? user.skills.join(", ")
            : ""
        );

        setInterests(
          Array.isArray(user.interests)
            ? user.interests.join(", ")
            : ""
        );

        setCareerGoal(user.careerGoal || "");

      } catch (err) {
        if (!active) return;

        console.error("Student Profile Error:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });

        // Invalid or expired token
        if (err.response?.status === 401) {
          sessionStorage.removeItem("mentora_token");

          navigate("/login", { replace: true });
          return;
        }

        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to load student profile"
        );

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  // ==================================
  // UPDATE STUDENT PROFILE
  // ==================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    // Convert skills text into array
    const skillsArray = skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    // Convert interests text into array
    const interestsArray = interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await axiosClient.put("/auth/me", {
        skills: skillsArray,
        interests: interestsArray,
        careerGoal: careerGoal.trim()
      });

      setMessage(
        response.data.message ||
        "Profile updated successfully!"
      );

    } catch (err) {
      console.error("Profile Update Error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });

      if (err.response?.status === 401) {
        sessionStorage.removeItem("mentora_token");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile"
      );

    } finally {
      setSaving(false);
    }
  };

  // ==================================
  // LOADING STATE
  // ==================================

  if (loading) {
    return (
      <p className="loading-message">
        Loading student profile...
      </p>
    );
  }

  // ==================================
  // PROFILE PAGE
  // ==================================

  return (
    <div className="auth-card">
      <h1>Mentora</h1>
      <h2>Student Profile</h2>

      <p>
        Update your skills, interests and career goal.
      </p>

      {message && (
        <p style={{ color: "green" }}>
          {message}
        </p>
      )}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {!error && (
        <form onSubmit={handleSubmit}>

          <label>Skills</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="JavaScript, React, Python"
          />

          <label>Interests</label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Web Development, AI"
          />

          <label>Career Goal</label>
          <input
            type="text"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="Become a Software Engineer"
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>

        </form>
      )}

      {error && (
        <button
          type="button"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>
      )}

      <p>
        <Link to="/dashboard">
          Back to Dashboard
        </Link>
      </p>
    </div>
  );
}

export default StudentProfile;