import { Link, NavLink, useNavigate } from "react-router-dom";
import { MENTOR_ROLES, useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Mentora
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>

        {user ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>

            {user.role === "Junior Student" && (
              <NavLink to="/profile/student">My Profile</NavLink>
            )}

            {MENTOR_ROLES.includes(user.role) && (
              <NavLink to="/profile/mentor">Mentor Profile</NavLink>
            )}

            {user.role === "Admin" && (
              <NavLink to="/admin/verifications">Verifications</NavLink>
            )}

            <span className="nav-user">{user.name}</span>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register" className="btn btn-primary">
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
