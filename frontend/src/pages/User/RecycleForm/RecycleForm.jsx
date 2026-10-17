import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "./RecycleForm.css";
import { FaUpload, FaTrash, FaLeaf, FaArrowRight, FaCoins } from "react-icons/fa";
import { fetchWasteCategories, submitDeclaration } from "../../../services/waste.service";

export default function RecycleForm({ userPoints, onPointsUpdate }) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef = useRef();

  // Load waste categories from backend on mount
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError("");
    try {
      const cats = await fetchWasteCategories();
      console.log("Waste categories response:", cats);  
      setCategories(cats || []);
      if (cats && cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err) {
      setCategoriesError("Unable to load waste categories. Please refresh the page.");
    } finally {
      setCategoriesLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const pointsPerKg = selectedCategory?.pointsPerKg ?? 0;

  const estimatedPoints = (() => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return 0;
    return Math.round(w * pointsPerKg);
  })();

  function validate() {
    const e = {};
    if (!categoryId) e.type = "Choose a waste type";
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
      const payload = {
        wasteCategoryId: categoryId,
        deliveryMethod: "DROP_OFF", // RecycleForm defaults to drop-off
        estimatedWeight: parseFloat(weight),
        description: description || undefined,
      };

      await submitDeclaration(payload);

      const categoryName = selectedCategory?.name || "waste";
      setSuccessMsg(
        `Successfully submitted! Your ${categoryName} recycling report is pending review.`
      );

      // Reset form
      setCategoryId(categories.length > 0 ? categories[0].id : "");
      setWeight("");
      setDescription("");
      images.forEach((it) => it.url && URL.revokeObjectURL(it.url));
      setImages([]);

      if (onPointsUpdate) {
        onPointsUpdate();
      }
    } catch (err) {
      if (err.data?.errors) {
        const fieldErrors = {};
        err.data.errors.forEach((issue) => {
          if (issue.field) fieldErrors[issue.field] = issue.message;
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          return;
        }
      }
      setErrors({ submit: err.message || "Submission failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recycle-container">
      <form className="recycle-card" onSubmit={handleSubmit} noValidate>
        <div className="recycle-header">
          <h2>
            <FaLeaf className="recycle-leaf-icon" aria-hidden="true" /> Quick Recycle Deposit
          </h2>
          <p>
            Log a drop-off recycling deposit directly. Staff will verify weight at the collection point.
          </p>
        </div>

        <div className="recycle-row">
          <label htmlFor="recycle-category">
            Waste Type <span style={{ color: "#dc2626" }}>*</span>
          </label>
          {categoriesLoading ? (
            <div style={{ color: "#64748b", fontSize: "0.88rem" }}>Loading categories...</div>
          ) : categoriesError ? (
            <div className="recycle-error">{categoriesError}</div>
          ) : (
            <select
              id="recycle-category"
              className="recycle-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.pointsPerKg || 10} pts/kg)
                </option>
              ))}
            </select>
          )}
          {errors.type && <div className="recycle-error">{errors.type}</div>}
        </div>

        <div className="recycle-row">
          <label htmlFor="recycle-weight">
            Estimated Weight (kg) <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            id="recycle-weight"
            className="recycle-input"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 1.8"
            inputMode="decimal"
            required
          />
          {errors.weight && <div className="recycle-error">{errors.weight}</div>}
        </div>

        <div className="recycle-row">
          <label htmlFor="recycle-notes">Notes (optional)</label>
          <textarea
            id="recycle-notes"
            className="recycle-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any specific details about the materials"
            rows={3}
          />
        </div>

        <div className="recycle-row">
          <label htmlFor="recycle-file-input">
            Photos (optional) <span style={{ fontSize: "0.75rem", color: "#64748b" }}>(Local preview only)</span>
          </label>
          <div className="recycle-upload-row">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              id="recycle-file-input"
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="recycle-btn-upload"
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              <FaUpload aria-hidden="true" /> Add Previews
            </button>

            {images.length > 0 && (
              <div className="recycle-images-preview">
                {images.map((it, idx) => (
                  <div key={idx} className="recycle-img-thumb">
                    <img src={it.url} alt={`Preview ${idx + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      title="Remove image"
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.images && <div className="recycle-error">{errors.images}</div>}
        </div>

        <div className="recycle-points-row">
          <div className="recycle-points-box">
            <FaCoins style={{ color: "#eab308", fontSize: "1.2rem" }} aria-hidden="true" />
            <span className="recycle-pts-number">{estimatedPoints}</span>
            <span className="recycle-pts-label">Estimated Eco Coins</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Final Eco Coins awarded upon staff weigh-in verification
          </span>
        </div>

        {errors.submit && <div className="recycle-error" style={{ marginBottom: "0.75rem" }}>{errors.submit}</div>}

        <div className="recycle-actions">
          <button
            type="submit"
            className="recycle-btn-primary"
            disabled={loading || categoriesLoading}
          >
            {loading ? "Submitting..." : "Submit Deposit"}
          </button>
          <button
            type="button"
            className="recycle-btn-secondary"
            onClick={() => {
              setCategoryId(categories.length > 0 ? categories[0].id : "");
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

        {successMsg && (
          <div className="recycle-success" role="status">
            <span>{successMsg}</span>
            <Link to="/history" style={{ color: "#16a34a", fontSize: "0.85rem", fontWeight: "700", textDecoration: "underline" }}>
              View in Waste History <FaArrowRight aria-hidden="true" />
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}
