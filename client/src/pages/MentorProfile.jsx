import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const mentorRoles = [
  "Senior Student",
  "Alumni",
  "Industry Expert"
];

const journeyStages = [
  "University",
  "Internship",
  "Job",
  "Current Role"
];

const MAX_JOURNEY_ENTRIES = 10;

let entryCounter = 0;

// Empty career journey entry (key is only used by React)
const newEntry = (values = {}) => ({
  key: `entry-${++entryCounter}`,
  stage: "University",
  organization: "",
  role: "",
  startYear: "",
  endYear: "",
  description: "",
  ...values
});

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
    endTime: "12:00"
  });

  // Alumni career journey (University -> Internship -> Job -> Current Role)
  const [journey, setJourney] = useState([]);

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
  // CAREER JOURNEY ENTRIES
  // ==================================

  const addJourneyEntry = () => {
    setJourney((previous) =>
      previous.length >= MAX_JOURNEY_ENTRIES
        ? previous
        : [...previous, newEntry()]
    );
  };

  const updateJourneyEntry = (key, field, value) => {
    setJourney((previous) =>
      previous.map((entry) =>
        entry.key === key ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeJourneyEntry = (key) => {
    setJourney((previous) =>
      previous.filter((entry) => entry.key !== key)
    );
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

          setForm({
            department: profile.department || "",
            skills: (profile.skills || []).join(", "),
            company: profile.company || "",
            expertise: profile.expertise || "",
            day: availability.day || "Saturday",
            startTime: availability.startTime || "10:00",
            endTime: availability.endTime || "12:00"
          });

          setJourney(
            (profile.careerJourney || []).map((entry) =>
              newEntry({
                stage: entry.stage || "University",
                organization: entry.organization || "",
                role: entry.role || "",
                startYear: entry.startYear ?? "",
                endYear: entry.endYear ?? "",
                description: entry.description || ""
              })
            )
          );

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

    // Career journey checks (alumni only)
    if (role === "Alumni") {
      const currentRoles = journey.filter(
        (entry) => entry.stage === "Current Role"
      );

      if (currentRoles.length > 1) {
        setError("Only one Current Role entry is allowed");
        return;
      }

      for (const entry of journey) {
        if (!entry.organization.trim() || !entry.role.trim()) {
          setError(
            "Fill in organization and role for every career journey entry, or remove the entry"
          );
          return;
        }

        if (
          entry.startYear &&
          entry.endYear &&
          Number(entry.startYear) > Number(entry.endYear)
        ) {
          setError(
            `${entry.stage}: start year cannot be after end year`
          );
          return;
        }
      }
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

    // Alumni can also provide their career journey
    if (role === "Alumni") {
      profileData.careerJourney = journey.map((entry) => ({
        stage: entry.stage,
        organization: entry.organization.trim(),
        role: entry.role.trim(),
        startYear: entry.startYear ? Number(entry.startYear) : null,
        endYear: entry.endYear ? Number(entry.endYear) : null,
        description: entry.description.trim()
      }));
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

      // Show the journey in the order saved by the server
      if (role === "Alumni" && response.data.profile?.careerJourney) {
        setJourney(
          response.data.profile.careerJourney.map((entry) =>
            newEntry({
              stage: entry.stage,
              organization: entry.organization,
              role: entry.role,
              startYear: entry.startYear ?? "",
              endYear: entry.endYear ?? "",
              description: entry.description || ""
            })
          )
        );
      }

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
    <div className="auth-card wide">
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
          <section className="journey-editor">
            <h3>Career Journey</h3>

            <p className="hint">
              Share your path (University → Internship → Job → Current
              Role) so students can learn from it. Entries are ordered
              automatically.
            </p>

            {journey.length === 0 && (
              <p className="hint">
                No stages added yet. Click "Add Stage" to start.
              </p>
            )}

            {journey.map((entry, index) => (
              <div className="journey-entry" key={entry.key}>
                <div className="journey-entry-header">
                  <strong>Stage {index + 1}</strong>

                  <button
                    type="button"
                    className="btn-small btn-danger-outline"
                    onClick={() => removeJourneyEntry(entry.key)}
                  >
                    Remove
                  </button>
                </div>

                <label>Career Stage</label>
                <select
                  value={entry.stage}
                  onChange={(e) =>
                    updateJourneyEntry(entry.key, "stage", e.target.value)
                  }
                >
                  {journeyStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>

                <label>Organization</label>
                <input
                  type="text"
                  value={entry.organization}
                  maxLength={100}
                  placeholder="University or company name"
                  onChange={(e) =>
                    updateJourneyEntry(
                      entry.key,
                      "organization",
                      e.target.value
                    )
                  }
                />

                <label>Role / Degree</label>
                <input
                  type="text"
                  value={entry.role}
                  maxLength={100}
                  placeholder="BSc in Software Engineering / Software Engineer"
                  onChange={(e) =>
                    updateJourneyEntry(entry.key, "role", e.target.value)
                  }
                />

                <div className="journey-years">
                  <div>
                    <label>Start Year</label>
                    <input
                      type="number"
                      value={entry.startYear}
                      min="1950"
                      placeholder="2020"
                      onChange={(e) =>
                        updateJourneyEntry(
                          entry.key,
                          "startYear",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label>End Year</label>
                    <input
                      type="number"
                      value={entry.endYear}
                      min="1950"
                      placeholder="Leave empty if ongoing"
                      onChange={(e) =>
                        updateJourneyEntry(
                          entry.key,
                          "endYear",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <label>What did you learn? (optional)</label>
                <textarea
                  rows={2}
                  value={entry.description}
                  maxLength={300}
                  placeholder="Short advice or highlight from this stage"
                  onChange={(e) =>
                    updateJourneyEntry(
                      entry.key,
                      "description",
                      e.target.value
                    )
                  }
                />
              </div>
            ))}

            <button
              type="button"
              className="btn-small btn-outline-small"
              onClick={addJourneyEntry}
              disabled={journey.length >= MAX_JOURNEY_ENTRIES}
            >
              + Add Stage
            </button>
          </section>
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