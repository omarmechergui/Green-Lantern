import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Login.css";
import logo from "../../../assets/pic/logo.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sceneRef = useRef(null);
  const cardRef = useRef(null);
  const formRef = useRef(null);

  // Determine redirect target after login
  const from = location.state?.from?.pathname || "/dashboard";

  function validate() {
    const e = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      e.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      e.email = "Please enter a valid email address";
    }

    if (!password) {
      e.password = "Password is required";
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
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || "Failed to log in. Please try again.");
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
    <div className="login-container">
      <div className="login-grid">
        {/* Login Card */}
        <div className="login-card" ref={formRef}>
          <div className="login-card-bg" />
          <div className="login-card-content">
            <h1 className="login-title">Green Lantern</h1>
            <p className="login-subtitle">
              Log in to continue managing your Green Waste account
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

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="login-inputname">Email</label>
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  type="email"
                  placeholder="you@example.com"
                  className={`input-field ${errors.email ? "input-error" : ""}`}
                  disabled={loading}
                />
                {errors.email && (
                  <div className="error-msg">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label className="login-inputname">Password</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    className={`input-field ${
                      errors.password ? "input-error" : ""
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="show-btn"
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-msg">{errors.password}</div>
                )}
              </div>

              <div className="form-bottom">
                <label className="remember">
                  <input type="checkbox" />
                  Remember me
                </label>
                <span className="forgot-link" style={{ cursor: "pointer" }}>
                  Forgot password?
                </span>
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? <span className="spinner"></span> : "Login"}
              </button>
            </form>

            <div className="signup-text">
              Don’t have an account? <Link to="/register">Sign up</Link>
            </div>
            <div className="copyright">© 2025 Green Lantern</div>
          </div>
        </div>

        {/* 3D Scene */}
        <div className="scene" ref={sceneRef}>
          <div className="card-3d" ref={cardRef}>
            <div className="card-bg"></div>
            <div className="card-content">
              <img src={logo} alt="Green Lantern" className="card-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
