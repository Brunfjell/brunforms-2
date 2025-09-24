import React, { useEffect, useState } from "react";
import slugify from "slugify";

export default function FormBuilder({ value, onChange, onRemove }) {
  const [nameEdited, setNameEdited] = useState(false);
  if (!value) return null;

  function updateFieldObj(next) {
    onChange?.({ ...value, ...next });
  }
  function updateField(key, val) {
    onChange?.({ ...value, [key]: val });
  }

  // auto-slug label -> name
  useEffect(() => {
    if (!nameEdited && value.label) {
      const autoName = slugify(value.label, { lower: true, strict: true });
      updateField("name", autoName);
    }
  }, [value.label]);

  function handleTypeChange(newType) {
    const next = { type: newType };

    if ((newType === "single_choice" || newType === "multiple_choice") && !value.options) {
      next.options = ["Option 1", "Option 2"];
    }

    if (newType !== "file_upload") {
      next.accept = undefined;
      next.maxSize = undefined;
    }

    updateFieldObj(next);
  }

  return (
    <div className="card shadow-md bg-base-100 p-4 space-y-3 border border-gray-200">
      <div className="flex justify-between items-center">
        <label className="font-semibold">Field</label>
        {onRemove && (
          <button
            type="button"
            className="btn btn-error btn-xs text-white"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>

      <input
        type="text"
        value={value.label || ""}
        onChange={(e) => updateField("label", e.target.value)}
        className="input input-bordered w-full"
        placeholder="Question label"
      />

      <label className="font-semibold">Field ID</label>
      <input
        type="text"
        value={value.name || ""}
        onChange={(e) => {
          setNameEdited(true);
          updateField("name", e.target.value);
        }}
        className="bg-base-300 p-2 rounded-md w-full"
        placeholder="Field name"
        readOnly
      />

      <label className="font-semibold">Field Type</label>
      <select
        value={value.type || "text"}
        onChange={(e) => handleTypeChange(e.target.value)}
        className="select select-bordered w-full"
      >
        <option value="text">Text</option>
        <option value="long_text">Long Text</option>
        <option value="number">Number</option>
        <option value="calendar">Date</option>
        <option value="time">Time</option>
        <option value="single_choice">Multiple Choice — single answer (radio)</option>
        <option value="multiple_choice">Multiple Choice — multiple answers (checkboxes)</option>
        <option value="file_upload">File Upload</option>
      </select>

      {(value.type === "single_choice" || value.type === "multiple_choice") && (
        <div className="space-y-2">
          <p className="font-medium">Choices</p>
          {(value.options || []).map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1"
                value={opt}
                onChange={(e) => {
                  const newOptions = [...(value.options || [])];
                  newOptions[i] = e.target.value;
                  updateField("options", newOptions);
                }}
              />
              <button
                type="button"
                className="btn btn-error text-white btn-xs"
                onClick={() => {
                  const newOptions = (value.options || []).filter((_, idx) => idx !== i);
                  updateField("options", newOptions);
                }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => updateField("options", [...(value.options || []), `Option ${ (value.options || []).length + 1 }`])}
          >
            + Add Option
          </button>
        </div>
      )}

      {value.type === "file_upload" && (
        <div className="space-y-2 text-sm">
          <label className="font-medium">File Settings</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="input input-bordered"
              placeholder="Max size (MB)"
              value={value.maxSize ?? 3}
              onChange={(e) => updateField("maxSize", Number(e.target.value))}
            />
            <input
              type="text"
              className="input input-bordered"
              placeholder="Accepted types (comma separated)"
              value={value.accept ?? "application/pdf"}
              onChange={(e) => updateField("accept", e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500">
            Example accept: <code>application/pdf,image/png</code>
          </p>
        </div>
      )}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="checkbox"
          checked={value.required || false}
          onChange={(e) => updateField("required", e.target.checked)}
        />
        Required
      </label>
    </div>
  );
}
