import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="page">
      <section className="hero">
        <h1>Mentora — UniMentor</h1>
        <p>
          Connect junior students with senior students, verified alumni and
          industry experts for guidance on skills, careers and university life.
        </p>

        <div className="hero-actions">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="feature-grid">
        <div className="card">
          <h3>Junior Students</h3>
          <p>Share your skills, interests and career goals to find the right mentor.</p>
        </div>
        <div className="card">
          <h3>Mentors</h3>
          <p>Senior students, alumni and industry experts share expertise and availability.</p>
        </div>
        <div className="card">
          <h3>Verified Profiles</h3>
          <p>Alumni and experts are verified by admins using official documents.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
