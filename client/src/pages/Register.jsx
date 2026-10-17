import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

// ---------- Validation helpers ----------
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]*$/;
const PASSWORD_RULES = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/
};

function validateForm(form) {
  const name = form.name.trim();

  if (name.length < 3 || name.length > 50) {
    return "Name must be between 3 and 50 characters.";
  }
  if (!NAME_REGEX.test(name)) {
    return "Name can only contain letters, spaces, dots, hyphens and apostrophes.";
  }
  if (form.password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!PASSWORD_RULES.upper.test(form.password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!PASSWORD_RULES.lower.test(form.password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!PASSWORD_RULES.number.test(form.password)) {
    return "Password must contain at least one number.";
  }
  if (!PASSWORD_RULES.special.test(form.password)) {
    return "Password must contain at least one special character.";
  }
  if (form.password !== form.confirmPassword) {
    return "Passwords do not match.";
  }
  return "";
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Junior Student",
    department: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // confirmPassword is for client-side checking only
      const { confirmPassword, ...payload } = form;
      payload.name = payload.name.trim();
      payload.email = payload.email.trim().toLowerCase();

      const response = await axiosClient.post("/auth/register", payload);

      console.log(response.data.message);

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Mentora</h1>
      <h2>Create Account</h2>
      <p>Join our university mentorship platform.</p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your name"
          minLength={3}
          maxLength={50}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Min 8 chars: upper, lower, number, symbol"
          minLength={8}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          required
        />

        <label>Select Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="Junior Student">Junior Student</option>
          <option value="Senior Student">Senior Student</option>
          <option value="Alumni">Alumni</option>
          <option value="Industry Expert">Industry Expert</option>
        </select>

        <label>Department</label>
        <input
          type="text"
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Software Engineering"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;