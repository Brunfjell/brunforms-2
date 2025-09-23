import React, { useEffect, useState } from "react";
import slugify from "slugify";

export default function FormBuilder({ value, onChange, onRemove }) {
  const [nameEdited, setNameEdited] = useState(false);

  if (!value) return null;

  function updateField(key, val) {
    onChange?.({ ...value, [key]: val });
  }

  useEffect(() => {
    if (!nameEdited && value.label) {
      const autoName = slugify(value.label, { lower: true, strict: true });
      updateField("name", autoName);
    }
  }, [value.label]);

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
        value={value.label}
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
        value={value.type}
        onChange={(e) => updateField("type", e.target.value)}
        className="select select-bordered w-full"
      >
        <option value="text">Text</option>
        <option value="long_text">Long Text</option>
        <option value="number">Number</option>
        <option value="calendar">Date</option>
        <option value="time">Time</option>
        <option value="multiple_choice">Multiple Choice</option>
        <option value="file_upload">File Upload</option>
      </select>

      {value.type === "multiple_choice" && (
        <div className="space-y-2">
          <p className="font-medium">Choices</p>
          {value.options?.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1"
                value={opt}
                onChange={(e) => {
                  const newOptions = [...value.options];
                  newOptions[i] = e.target.value;
                  updateField("options", newOptions);
                }}
              />
              <button
                type="button"
                className="btn btn-error text-white btn-xs"
                onClick={() => {
                  const newOptions = value.options.filter((_, idx) => idx !== i);
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
            onClick={() =>
              updateField("options", [...(value.options || []), "New Option"])
            }
          >
            + Add Option
          </button>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={value.allowMultiple || false}
              onChange={(e) => updateField("allowMultiple", e.target.checked)}
            />
            Allow multiple selections
          </label>
        </div>
      )}

      {value.type === "file_upload" && (
        <div className="space-y-2">
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={(e) => updateField("file", e.target.files?.[0] || null)}
          />
          {value.file && (
            <p className="text-sm text-gray-500">
              Selected: {value.file.name}
            </p>
          )}
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
