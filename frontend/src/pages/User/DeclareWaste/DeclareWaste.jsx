import React, { useState, useRef, useEffect, useCallback } from "react";
import "./DeclareWaste.css";
import { FaUpload, FaTrash, FaLeaf, FaArrowRight, FaCoins } from "react-icons/fa";
import { fetchWasteCategories, submitDeclaration } from "../../../services/waste.service";

export default function DeclareWaste({ onSubmitted }) {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("DROP_OFF");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // {file, url} — local preview only
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
      const payload = {
        wasteCategoryId: categoryId,
        deliveryMethod,
        estimatedWeight: parseFloat(weight),
        description: description || undefined,
      };

      const response = await submitDeclaration(payload);

      const categoryName = selectedCategory?.name || "waste";
      setSuccessMsg(
        `Declaration submitted successfully! Your ${categoryName} report is now pending review.`
      );
      setCategoryId(categories.length > 0 ? categories[0].id : "");
      setDeliveryMethod("DROP_OFF");
      setWeight("");
      setDescription("");
      images.forEach((it) => it.url && URL.revokeObjectURL(it.url));
      setImages([]);
      if (onSubmitted) onSubmitted(response?.data?.declaration);
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
      setErrors({ submit: err.message || "Submission failed — try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="declare-waste-container">
      <form className="declare-waste-card" onSubmit={handleSubmit} noValidate>
        <div className="declare-waste-header">
          <h2>
            <FaLeaf className="declare-waste-leaf-icon" aria-hidden="true" /> Declare Recyclable Waste
          </h2>
          <p className="declare-waste-muted">
            Submit your recyclable waste deposit details for staff verification. Eco Coins are awarded after collection review.
          </p>
        </div>

        <div className="declare-waste-row">
          <label htmlFor="declare-waste-category">
            Waste Type <span className="required-star">*</span>
          </label>
          {categoriesLoading ? (
            <div className="declare-waste-muted">Loading categories...</div>
          ) : categoriesError ? (
            <div className="declare-waste-error">{categoriesError}</div>
          ) : (
            <select
              id="declare-waste-category"
              className="declare-waste-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
          {errors.type && <div className="declare-waste-error">{errors.type}</div>}
        </div>

        <div className="declare-waste-row">
          <label htmlFor="declare-delivery-method">
            Delivery Method <span className="required-star">*</span>
          </label>
          <select
            id="declare-delivery-method"
            className="declare-waste-select"
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
          >
            <option value="DROP_OFF">Drop Off at Collection Point</option>
            <option value="PICKUP">Request Home Pickup</option>
          </select>
        </div>

        <div className="declare-waste-row">
          <label htmlFor="declare-waste-weight">
            Estimated Weight (kg) <span className="required-star">*</span>
          </label>
          <input
            id="declare-waste-weight"
            className="declare-waste-input"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 2.5"
            inputMode="decimal"
            required
            aria-describedby="weight-calc-note"
          />
          {errors.weight && <div className="declare-waste-error">{errors.weight}</div>}
          {errors.estimatedWeight && <div className="declare-waste-error">{errors.estimatedWeight}</div>}
        </div>

        <div className="declare-waste-row">
          <label htmlFor="declare-waste-description">
            Description / Notes (optional)
          </label>
          <textarea
            id="declare-waste-description"
            className="declare-waste-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief details (condition, bulky items, packaging, etc.)"
            rows={3}
          />
        </div>

        <div className="declare-waste-row">
          <label htmlFor="declare-waste-file-input">
            Photos (optional) <span className="preview-badge-note">Local Preview Only</span>
          </label>
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
              <FaUpload aria-hidden="true" /> Add Image Previews
            </button>

            {images.length > 0 && (
              <div className="declare-waste-images-preview">
                {images.map((it, idx) => (
                  <div key={idx} className="declare-waste-img-thumb">
                    <img src={it.url} alt={`Local preview ${idx + 1}`} />
                    <button
                      type="button"
                      className="declare-waste-img-remove"
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
          <small className="declare-waste-muted" style={{ marginTop: "4px" }}>
            Note: Cloud image storage is not enabled; images are previewed locally only and will not be uploaded to the server.
          </small>
          {errors.images && <div className="declare-waste-error">{errors.images}</div>}
        </div>

        {/* Estimated Points Card */}
        <div className="declare-waste-points-row">
          <div className="declare-waste-points-box">
            <FaCoins style={{ color: "#eab308", fontSize: "1.2rem" }} aria-hidden="true" />
            <span className="declare-waste-pts-number">{estimatedPoints}</span>
            <span className="declare-waste-pts-label">Estimated Eco Coins</span>
          </div>

          <div id="weight-calc-note" className="declare-waste-calc-note">
            <span>Rate: {pointsPerKg} pts/kg • Final coins awarded by collection center staff upon verified weighing</span>
          </div>
        </div>

        {errors.submit && (
          <div className="declare-waste-error declare-waste-submit-error" role="alert">
            {errors.submit}
          </div>
        )}

        <div className="declare-waste-form-actions">
          <button
            type="submit"
            className="declare-waste-btn-primary"
            disabled={loading || categoriesLoading}
          >
            {loading ? <span className="declare-waste-spinner" /> : "Submit Declaration"}
          </button>
          <button
            type="button"
            className="declare-waste-btn-secondary"
            onClick={() => {
              setCategoryId(categories.length > 0 ? categories[0].id : "");
              setDeliveryMethod("DROP_OFF");
              setWeight("");
              setDescription("");
              images.forEach((it) => it.url && URL.revokeObjectURL(it.url));
              setImages([]);
              setErrors({});
              setSuccessMsg("");
            }}
          >
            Reset Form
          </button>
        </div>

        {successMsg && (
          <div className="declare-waste-success" role="status">
            <span>{successMsg}</span>
            <a href="/history" className="view-history-action">
              View your submission in Waste History <FaArrowRight aria-hidden="true" />
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
