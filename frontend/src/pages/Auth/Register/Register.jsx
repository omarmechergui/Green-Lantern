import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Register.css";
import logo from "../../../assets/pic/logo.jpg";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const sceneRef = useRef(null);
  const cardRef = useRef(null);
  const formRef = useRef(null);

  function validate() {
    const e = {};
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername) {
      e.username = "Full name / username is required";
    } else if (trimmedUsername.length < 2) {
      e.username = "Name must be at least 2 characters long";
    }

    if (!trimmedEmail) {
      e.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      e.email = "Please enter a valid email address";
    }

    if (!password) {
      e.password = "Password is required";
    } else {
      if (password.length < 8) {
        e.password = "Password must be at least 8 characters long";
      } else if (!/[A-Z]/.test(password)) {
        e.password = "Must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(password)) {
        e.password = "Must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(password)) {
        e.password = "Must contain at least one number";
      }
    }

    if (!confirmPassword) {
      e.confirmPassword = "Confirm your password";
    } else if (password !== confirmPassword) {
      e.confirmPassword = "Passwords do not match!";
    }

    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setServerError("");

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setLoading(true);
    try {
      // Map username to fullName as required by the backend User model
      await register(username.trim(), email.trim().toLowerCase(), password);
      // Backend automatically sets the session cookie upon registration
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // If backend returns array of validation errors, extract first or message
      if (err.data?.errors && Array.isArray(err.data.errors) && err.data.errors.length > 0) {
        const fieldErrors = {};
        err.data.errors.forEach((e) => {
          if (e.field === "fullName") fieldErrors.username = e.message;
          else if (e.field === "email") fieldErrors.email = e.message;
          else if (e.field === "password") fieldErrors.password = e.message;
        });
        setErrors(fieldErrors);
        setServerError(err.data.errors.map(e => e.message).join(". "));
      } else {
        setServerError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const scene = sceneRef.current;
    const card = cardRef.current;
    const form = formRef.current;
    if (!scene || !card || !form) return;

    const onMove = (e) => {
      const rect = scene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = x * -20;
      const rotateX = y * 12;
      const moveX = x * 15;
      const moveY = y * 10;

      card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(6px)`;
      form.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;
    };

    const onLeave = () => {
      card.style.transform = `rotateY(0deg) rotateX(0deg)`;
      form.style.transform = `translateX(0px) translateY(0px)`;
    };

    scene.addEventListener("mousemove", onMove);
    scene.addEventListener("mouseleave", onLeave);

    return () => {
      scene.removeEventListener("mousemove", onMove);
      scene.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="register-container">
      <div className="register-grid">
        {/* Register Form */}
        <div className="register-card" ref={formRef}>
          <div className="register-card-bg" />
          <div className="register-card-content">
            <h1 className="register-title">Register</h1>
            <p className="register-subtitle">
              Create your account to start managing your Green Waste
            </p>

            {serverError && (
              <div
                className="server-error-banner"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#fca5a5",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  lineHeight: "1.4",
                }}
              >
                {serverError}
              </div>
            )}

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="register-form-group">
                <label className="register-label">Username</label>
                <input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
                  }}
                  type="text"
                  placeholder="Your full name"
                  className={`register-input ${errors.username ? "register-error" : ""}`}
                  disabled={loading}
                />
                {errors.username && <div className="register-error-msg">{errors.username}</div>}
              </div>

              <div className="register-form-group">
                <label className="register-label">Email</label>
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  type="email"
                  placeholder="you@example.com"
                  className={`register-input ${errors.email ? "register-error" : ""}`}
                  disabled={loading}
                />
                {errors.email && <div className="register-error-msg">{errors.email}</div>}
              </div>

              <div className="register-form-group">
                <label className="register-label">Password</label>
                <div className="register-relative">
                  <input
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    className={`register-input ${errors.password ? "register-error" : ""}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="register-show-btn"
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <div className="register-error-msg">{errors.password}</div>}
              </div>

              <div className="register-form-group">
                <label className="register-label">Confirm Password</label>
                <div className="register-relative">
                  <input
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    className={`register-input ${errors.confirmPassword ? "register-error" : ""}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="register-show-btn"
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && <div className="register-error-msg">{errors.confirmPassword}</div>}
              </div>

              <button type="submit" disabled={loading} className="register-btn">
                {loading ? <span className="register-spinner"></span> : "Register"}
              </button>
            </form>

            <div className="register-login-text">
              Already have an account? <Link to="/login">Login</Link>
            </div>
            <div className="register-copyright">© 2025 Green Lantern</div>
          </div>
        </div>

        {/* 3D Logo Scene */}
        <div className="register-scene" ref={sceneRef}>
          <div className="register-card-3d" ref={cardRef}>
            <div className="register-card-bg-3d"></div>
            <div className="register-card-content-3d">
              <img src={logo} alt="Green Lantern" className="register-card-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
