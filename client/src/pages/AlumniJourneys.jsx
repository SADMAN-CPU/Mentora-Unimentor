import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

// Show years like "2016 – 2020", "2024 – Present" or just "2022"
const formatYears = (startYear, endYear, stage) => {
  if (startYear && endYear) return `${startYear} – ${endYear}`;
  if (startYear) {
    return stage === "Current Role" ? `${startYear} – Present` : `${startYear}`;
  }
  if (endYear) return `${endYear}`;
  return "";
};

function AlumniJourneys() {
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================
  // LOAD ALUMNI CAREER JOURNEYS
  // ==================================

  useEffect(() => {
    let active = true;

    const fetchAlumni = async () => {
      const token = sessionStorage.getItem("mentora_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await axiosClient.get("/mentor/alumni");

        if (active) setAlumni(response.data.alumni || []);

      } catch (err) {
        if (!active) return;

        if (err.response?.status === 401) {
          sessionStorage.removeItem("mentora_token");
          navigate("/login", { replace: true });
          return;
        }

        setError(
          err.response?.data?.message ||
          "Unable to load alumni career journeys"
        );

      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAlumni();

    return () => {
      active = false;
    };
  }, [navigate]);

  // ==================================
  // SEARCH (name, company, expertise, organization, role)
  // ==================================

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return alumni;

    return alumni.filter((person) =>
      [
        person.name,
        person.department,
        person.company,
        person.expertise,
        ...person.careerJourney.flatMap((entry) => [
          entry.organization,
          entry.role
        ])
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [alumni, search]);

  if (loading) {
    return <p className="loading-message">Loading career journeys...</p>;
  }

  return (
    <div className="journey-page">
      <h1>Alumni Career Journeys</h1>

      <p className="hint">
        Learn from real career paths: University → Internship → Job →
        Current Role.
      </p>

      {error && <p className="error">{error}</p>}

      {!error && (
        <input
          type="search"
          className="journey-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company, role or university"
        />
      )}

      {!error && filtered.length === 0 && (
        <p className="hint">
          {alumni.length === 0
            ? "No alumni have shared a career journey yet."
            : "No alumni match your search."}
        </p>
      )}

      <div className="journey-list">
        {filtered.map((person) => (
          <article className="journey-card" key={person.id}>
            <header>
              <h2>{person.name}</h2>

              {person.verified && (
                <span className="badge-verified">Verified Mentor</span>
              )}
            </header>

            <p className="journey-meta">
              {[person.department, person.company, person.expertise]
                .filter(Boolean)
                .join(" • ")}
            </p>

            <ol className="timeline">
              {person.careerJourney.map((entry, index) => (
                <li key={`${person.id}-${index}`}>
                  <span className="timeline-stage">{entry.stage}</span>

                  <strong>{entry.role}</strong>
                  <span> at {entry.organization}</span>

                  {formatYears(entry.startYear, entry.endYear, entry.stage) && (
                    <span className="timeline-years">
                      {formatYears(entry.startYear, entry.endYear, entry.stage)}
                    </span>
                  )}

                  {entry.description && (
                    <p className="timeline-note">{entry.description}</p>
                  )}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      <p>
        <Link to="/dashboard">Back to Dashboard</Link>
      </p>
    </div>
  );
}

export default AlumniJourneys;