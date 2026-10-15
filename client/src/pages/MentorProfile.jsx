
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const mentorRoles = [
  "Senior Student",
  "Alumni",
  "Industry Expert"
];

function MentorProfile() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [profileExists, setProfileExists] = useState(false);

  const [form, setForm] = useState({
    department: "",
    skills: "",
    company: "",
    expertise: "",
    day: "Saturday",
    startTime: "10:00",
    endTime: "12:00",
    stage: "University",
    organization: "",
    journeyRole: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==================================
  // HANDLE INPUT CHANGES
  // ==================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // ==================================
  // LOAD EXISTING MENTOR PROFILE
  // ==================================

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      const token = sessionStorage.getItem("mentora_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        // Get logged-in user information
        const userResponse = await axiosClient.get("/auth/me");

        const user = userResponse.data.user;

        if (!mentorRoles.includes(user.role)) {
          navigate("/dashboard", { replace: true });
          return;
        }

        if (!active) return;

        setRole(user.role);

        setForm((previous) => ({
          ...previous,
          department: user.department || ""
        }));

        // Try fetching an existing mentor profile
        try {
          const response = await axiosClient.get(
            "/mentor/profile/me"
          );

          if (!active) return;

          const profile = response.data.profile;

          const availability =
            profile.weeklyAvailability?.[0] || {};

          const journey =
            profile.careerJourney?.[0] || {};

          setForm({
            department: profile.department || "",
            skills: (profile.skills || []).join(", "),
            company: profile.company || "",
            expertise: profile.expertise || "",
            day: availability.day || "Saturday",
            startTime: availability.startTime || "10:00",
            endTime: availability.endTime || "12:00",
            stage: journey.stage || "University",
            organization: journey.organization || "",
            journeyRole: journey.role || ""
          });

          setProfileExists(true);

        } catch (err) {
          // 404 means this mentor has no profile yet
          if (err.response?.status !== 404) {
            throw err;
          }

          if (active) {
            setProfileExists(false);
          }
        }

      } catch (err) {
        if (!active) return;

        console.error("Mentor Profile Error:", err);

        if (err.response?.status === 401) {
          sessionStorage.removeItem("mentora_token");
          navigate("/login", { replace: true });
          return;
        }

        setError(
          err.response?.data?.message ||
          "Unable to load mentor profile"
        );

      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  // ==================================
  // CREATE OR UPDATE MENTOR PROFILE
  // ==================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (form.startTime >= form.endTime) {
      setError("End time must be after start time");
      return;
    }

    // Convert comma-separated skills into array
    const skillsArray = form.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const profileData = {
      department: form.department.trim(),
      skills: skillsArray,
      company: form.company.trim(),
      expertise: form.expertise.trim(),

      weeklyAvailability: [
        {
          day: form.day,
          startTime: form.startTime,
          endTime: form.endTime
        }
      ]
    };

    // Alumni can also provide career journey
    if (role === "Alumni") {
      profileData.careerJourney =
        form.organization.trim() && form.journeyRole.trim()
          ? [
              {
                stage: form.stage,
                organization: form.organization.trim(),
                role: form.journeyRole.trim()
              }
            ]
          : [];
    }

    setSaving(true);

    try {
      let response;

      if (profileExists) {
        // Update existing mentor profile
        response = await axiosClient.put(
          "/mentor/profile/me",
          profileData
        );
      } else {
        // Create new mentor profile
        response = await axiosClient.post(
          "/mentor/profile",
          profileData
        );
      }

      setProfileExists(true);

      setMessage(
        response.data.message ||
        "Mentor profile saved successfully"
      );

    } catch (err) {
      console.error("Save Mentor Profile Error:", err);

      if (err.response?.status === 401) {
        sessionStorage.removeItem("mentora_token");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
        "Failed to save mentor profile"
      );

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="loading-message">
        Loading mentor profile...
      </p>
    );
  }

  if (error && !role) {
    return (
      <div className="auth-card">
        <p className="error">{error}</p>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1>Mentora</h1>

      <h2>
        {profileExists
          ? "Edit Mentor Profile"
          : "Create Mentor Profile"}
      </h2>

      <p>Role: {role}</p>

      {message && (
        <p style={{ color: "green" }}>
          {message}
        </p>
      )}

      {error && (
        <p className="error">{error}</p>
      )}

      <form onSubmit={handleSubmit}>

        <label>Department</label>
        <input
          type="text"
          name="department"
          value={form.department}
          onChange={handleChange}
          required
        />

        <label>Skills</label>
        <input
          type="text"
          name="skills"
          value={form.skills}
          onChange={handleChange}
          placeholder="JavaScript, React, MongoDB"
        />

        <label>Company</label>
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Example Tech Ltd"
        />

        <label>Expertise</label>
        <input
          type="text"
          name="expertise"
          value={form.expertise}
          onChange={handleChange}
          placeholder="Full Stack Development"
        />

        <h3>Weekly Availability</h3>

        <label>Available Day</label>
        <select
          name="day"
          value={form.day}
          onChange={handleChange}
        >
          {[
            "Saturday", "Sunday", "Monday",
            "Tuesday", "Wednesday", "Thursday",
            "Friday"
          ].map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <label>Start Time</label>
        <input
          type="time"
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          required
        />

        <label>End Time</label>
        <input
          type="time"
          name="endTime"
          value={form.endTime}
          onChange={handleChange}
          required
        />

        {/* Career Journey for Alumni */}
        {role === "Alumni" && (
          <>
            <h3>Career Journey</h3>

            <label>Career Stage</label>
            <select
              name="stage"
              value={form.stage}
              onChange={handleChange}
            >
              <option value="University">University</option>
              <option value="Internship">Internship</option>
              <option value="Job">Job</option>
            </select>

            <label>Organization</label>
            <input
              type="text"
              name="organization"
              value={form.organization}
              onChange={handleChange}
              placeholder="University or Company"
            />

            <label>Role</label>
            <input
              type="text"
              name="journeyRole"
              value={form.journeyRole}
              onChange={handleChange}
              placeholder="Software Engineer"
            />
          </>
        )}

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : profileExists
              ? "Update Mentor Profile"
              : "Create Mentor Profile"}
        </button>
      </form>

      <p>
        <Link to="/dashboard">
          Back to Dashboard
        </Link>
      </p>
    </div>
  );
}

export default MentorProfile;
