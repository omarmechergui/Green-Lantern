import React, { useRef, useState, useEffect } from "react";
import "./Login.css";
import logo from "../../../assets/pic/logo.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const sceneRef = useRef(null);
  const cardRef = useRef(null);
  const formRef = useRef(null);

  function validate() {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    alert("Logged in (demo). Replace with real backend call.");
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

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="login-inputname">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className={`input-field ${errors.email ? "input-error" : ""}`}
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
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    className={`input-field ${
                      errors.password ? "input-error" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="show-btn"
                  >
                    {showPwd ? "" : ""}
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
                <a href="#" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? <span className="spinner"></span> : "Login"}
              </button>
            </form>

            <div className="signup-text">
              Don’t have an account? <a href="#">Sign up</a>
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
