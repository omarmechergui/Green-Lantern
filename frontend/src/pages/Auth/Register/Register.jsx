import React, { useRef, useState, useEffect } from "react";
import "./Register.css";
import logo from "../../../assets/pic/logo.jpg";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const sceneRef = useRef(null);
  const cardRef = useRef(null);
  const formRef = useRef(null);

  function validate() {
    const e = {};
    if (!username) e.username = "Username is required";
    if (!email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match!";
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
    alert("Registered (demo). Replace with backend.");
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

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="register-form-group">
                <label className="register-label">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  placeholder="Your username"
                  className={`register-input ${errors.username ? "register-error" : ""}`}
                />
                {errors.username && <div className="register-error-msg">{errors.username}</div>}
              </div>

              <div className="register-form-group">
                <label className="register-label">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className={`register-input ${errors.email ? "register-error" : ""}`}
                />
                {errors.email && <div className="register-error-msg">{errors.email}</div>}
              </div>

              <div className="register-form-group">
                <label className="register-label">Password</label>
                <div className="register-relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    className={`register-input ${errors.password ? "register-error" : ""}`}
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
                    onChange={(e) => setconfirmPassword(e.target.value)}
                    type={showPwd ? "text" : "confirmPassword"}
                    placeholder="••••••••"
                    className={`register-input ${errors.confirmPassword ? "register-error" : ""}`}
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
              Already have an account? <a href="#">Login</a>
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
