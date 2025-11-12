import React, { useState, useRef } from "react";
import "./DeclareWaste.css";
import { FaUpload, FaTrash, FaLeaf } from "react-icons/fa";

const TYPE_POINT_RATE = {
  plastic: 2,
  paper: 1.5,
  metal: 3,
  clothes: 1.2,
  organic: 0.8,
  other: 1,
};

export default function DeclareWaste({ onSubmitted }) {
  const [type, setType] = useState("plastic");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // {file, url}
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef = useRef();

  const estimatedPoints = (() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return 0;
    const rate = TYPE_POINT_RATE[type] ?? 1;
    return Math.round(w * rate);
  })();

  function validate() {
    const e = {};
    if (!type) e.type = "Choose a waste type";
    if (!weight) e.weight = "Enter weight (kg)";
    else if (isNaN(Number(weight)) || Number(weight) <= 0)
      e.weight = "Weight must be a positive number";
    if (images.length > 5) e.images = "Maximum 5 images allowed";
    return e;
  }

  function handleFilesChange(ev) {
    const files = Array.from(ev.target.files || []);
    const accepted = files.slice(0, 5 - images.length);
    const previews = accepted.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...previews]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(idx) {
    setImages((prev) => {
      const toRevoke = prev[idx];
      if (toRevoke && toRevoke.url) URL.revokeObjectURL(toRevoke.url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("weight", weight);
      fd.append("description", description);
      fd.append("estimatedPoints", estimatedPoints);
      images.forEach((it, i) => fd.append(`image_${i}`, it.file));

      await new Promise((r) => setTimeout(r, 1100));

      setSuccessMsg(`Done — your report was submitted. You earned ~${estimatedPoints} pts (demo).`);
      setType("plastic");
      setWeight("");
      setDescription("");
      images.forEach((it) => it.url && URL.revokeObjectURL(it.url));
      setImages([]);
      if (onSubmitted) onSubmitted({ type, weight, estimatedPoints });
    } catch (err) {
      setErrors({ submit: "Submission failed — try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="declare-waste-container">
      <form className="declare-waste-card" onSubmit={handleSubmit} noValidate>
        <div className="declare-waste-header">
          <h2>
            <FaLeaf className="declare-waste-leaf-icon" /> Declare Waste
          </h2>
          <p className="declare-waste-muted">Report recyclable waste and earn points</p>
        </div>

        <div className="declare-waste-row">
          <label>Type</label>
          <select
            className="declare-waste-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="plastic">Plastic</option>
            <option value="paper">Paper</option>
            <option value="metal">Metal</option>
            <option value="clothes">Clothes</option>
            <option value="organic">Organic</option>
            <option value="other">Other</option>
          </select>
          {errors.type && <div className="declare-waste-error">{errors.type}</div>}
        </div>

        <div className="declare-waste-row">
          <label>Weight (kg)</label>
          <input
            className="declare-waste-input"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 2.5"
            inputMode="decimal"
          />
          {errors.weight && <div className="declare-waste-error">{errors.weight}</div>}
        </div>

        <div className="declare-waste-row">
          <label>Description (optional)</label>
          <textarea
            className="declare-waste-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief details (condition, bulky, etc.)"
            rows={3}
          />
        </div>

        <div className="declare-waste-row">
          <label>Photos (optional)</label>
          <div className="declare-waste-upload-row">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              id="declare-waste-file-input"
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="declare-waste-btn-upload"
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              <FaUpload /> Upload images
            </button>

            <div className="declare-waste-images-preview">
              {images.map((it, idx) => (
                <div key={idx} className="declare-waste-img-thumb">
                  <img src={it.url} alt={`preview-${idx}`} />
                  <button
                    type="button"
                    className="declare-waste-img-remove"
                    onClick={() => removeImage(idx)}
                    title="Remove"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {errors.images && <div className="declare-waste-error">{errors.images}</div>}
        </div>

        <div className="declare-waste-points-row">
          <div className="declare-waste-points-box">
            <span className="declare-waste-pts-number">{estimatedPoints}</span>
            <span className="declare-waste-pts-label">Estimated Points</span>
          </div>

          <div className="declare-waste-calc-note">
            <small>Points = weight × rate ({TYPE_POINT_RATE[type]} pts/kg)</small>
          </div>
        </div>

        {errors.submit && <div className="declare-waste-error declare-waste-submit-error">{errors.submit}</div>}

        <div className="declare-waste-form-actions">
          <button type="submit" className="declare-waste-btn-primary" disabled={loading}>
            {loading ? <span className="declare-waste-spinner" /> : "Submit Declaration"}
          </button>
          <button
            type="button"
            className="declare-waste-btn-secondary"
            onClick={() => {
              setType("plastic");
              setWeight("");
              setDescription("");
              images.forEach((it) => it.url && URL.revokeObjectURL(it.url));
              setImages([]);
              setErrors({});
              setSuccessMsg("");
            }}
          >
            Reset
          </button>
        </div>

        {successMsg && <div className="declare-waste-success">{successMsg}</div>}
      </form>
    </div>
  );
}
