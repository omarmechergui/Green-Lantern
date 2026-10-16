import React, { useState, useRef } from "react";
import "./RecycleForm.css";
import { FaUpload, FaTrash, FaLeaf } from "react-icons/fa";

const TYPE_POINT_RATE = {
  plastic: 2,
  paper: 1.5,
  metal: 3,
  clothes: 1.2,
  food: 0.8,
  other: 1,
};

export default function RecycleForm({ userPoints, onPointsUpdate }) {
  const [type, setType] = useState("plastic");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef = useRef();

  const estimatedPoints = (() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return 0;
    return Math.round(w * (TYPE_POINT_RATE[type] ?? 1));
  })();

  function validate() {
    const e = {};
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0)
      e.weight = "Enter a valid positive weight";
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
      await new Promise((r) => setTimeout(r, 1000)); // simulate API
      setSuccessMsg(`Successfully submitted! You earned ${estimatedPoints} pts.`);
      if (onPointsUpdate) onPointsUpdate(estimatedPoints);

      // Reset form
      setType("plastic");
      setWeight("");
      setDescription("");
      images.forEach((it) => it.url && URL.revokeObjectURL(it.url));
      setImages([]);
    } catch (err) {
      setErrors({ submit: "Submission failed — try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recycle-container">
      <form className="recycle-card" onSubmit={handleSubmit} noValidate>
        <div className="recycle-header">
          <h2><FaLeaf /> Recycle Waste</h2>
          <p>Earn points by recycling properly</p>
        </div>

        <div className="recycle-row">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="plastic">Plastic</option>
            <option value="paper">Paper</option>
            <option value="metal">Metal</option>
            <option value="clothes">Clothes</option>
            <option value="food">Food</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="recycle-row">
          <label>Weight (kg)</label>
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 2.5"
          />
          {errors.weight && <div className="recycle-error">{errors.weight}</div>}
        </div>

        <div className="recycle-row">
          <label>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details about waste"
            rows={3}
          />
        </div>

        <div className="recycle-row">
          <label>Photos (optional)</label>
          <div className="recycle-upload-row">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              style={{ display: "none" }}
            />
            <button type="button" onClick={() => fileRef.current && fileRef.current.click()}>
              <FaUpload /> Upload images
            </button>

            <div className="recycle-images-preview">
              {images.map((it, idx) => (
                <div key={idx} className="recycle-img-thumb">
                  <img src={it.url} alt={`preview-${idx}`} />
                  <button type="button" onClick={() => removeImage(idx)} title="Remove"><FaTrash /></button>
                </div>
              ))}
            </div>
          </div>
          {errors.images && <div className="recycle-error">{errors.images}</div>}
        </div>

        <div className="recycle-points-row">
          <span>Estimated Points: <strong>{estimatedPoints}</strong></span>
        </div>

        {errors.submit && <div className="recycle-error">{errors.submit}</div>}
        {successMsg && <div className="recycle-success">{successMsg}</div>}

        <div className="recycle-actions">
          <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
          <button type="button" onClick={() => {
            setType("plastic"); setWeight(""); setDescription(""); setImages([]); setErrors({}); setSuccessMsg("");
          }}>Reset</button>
        </div>
      </form>
    </div>
  );
}
