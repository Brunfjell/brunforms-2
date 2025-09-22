import React, { useState } from "react";
import supabase from "../utils/supabaseClient";
import generateToken from "../utils/tokenGenerator";
import FileUpload from "./FileUpload";
import { useAuthStore } from "../stores/authStore";

export default function FormRenderer({ form, readonly = false }) {
  const hrProfile = useAuthStore((state) => state.hrProfile);
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState(null);

  if (!form?.schema || !Array.isArray(form.schema)) {
    return <p className="text-red-500 font-medium">Invalid form schema</p>;
  }

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emptyRequired = form.schema.some(
      (field) =>
        field.required &&
        (values[field.name] === undefined ||
          values[field.name] === "" ||
          (Array.isArray(values[field.name]) &&
            values[field.name].length === 0))
    );

    if (emptyRequired) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const newToken = generateToken();

      const { error } = await supabase
        .from("applicants")
        .insert({
          form_id: form.id,
          token: newToken,
          data: values,
        })
        .select()
        .single();

      if (error) throw error;

      setSubmitted(true);
      setToken(newToken);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Submission failed");
    }
  };

  if (submitted) {
    return (
      <div className="alert alert-success shadow-lg mt-4">
        <div>
          <span className="font-bold text-lg">Thank you for applying!</span>
          <p className="mt-2">
            Save this token to keep updated about your status:
          </p>
          <p className="font-mono text-lg mt-1">{token}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {form.schema.map((field) => {
        const value = values[field.name] || "";

        if (readonly) {
          return (
            <div key={field.id} className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">{field.label}</span>
              </label>
              <div className="input bg-gray-100 border rounded px-2 py-1">
                {Array.isArray(value) ? value.join(", ") : value || "-"}
              </div>
            </div>
          );
        }

        if (field.type === "file_upload") {
          return (
            <div key={field.id} className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">{field.label}</span>
              </label>
              <FileUpload
                applicantId={token || "temp"}
                onUploaded={(url) =>
                  handleChange(field.name, [
                    ...(values[field.name] || []),
                    url,
                  ])
                }
              />
            </div>
          );
        }

        if (field.type === "multiple_choice") {
          const allowMultiple = field.allowMultiple || false;
          const selected = Array.isArray(value) ? value : [value].filter(Boolean);

          return (
            <div key={field.id} className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </span>
              </label>
              <div className="space-y-2">
                {field.options?.map((opt, idx) =>
                  allowMultiple ? (
                    <label
                      key={idx}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name={`${field.name}-${idx}`}
                        value={opt}
                        checked={selected.includes(opt)}
                        onChange={(e) => {
                          let updated = [...selected];
                          if (e.target.checked) {
                            updated.push(opt);
                          } else {
                            updated = updated.filter((v) => v !== opt);
                          }
                          handleChange(field.name, updated);
                        }}
                        className="checkbox checkbox-primary checkbox-md"
                      />
                      <span>{opt}</span>
                    </label>
                  ) : (
                    <label
                      key={idx}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={opt}
                        checked={value === opt}
                        onChange={() => handleChange(field.name, opt)}
                        className="radio radio-primary radio-md"
                        required={field.required}
                      />
                      <span>{opt}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          );
        }

        const inputTypeMap = {
          text: "text",
          long_text: "textarea",
          number: "number",
          calendar: "date",
          time: "time",
        };

        const type = inputTypeMap[field.type] || "text";

        return (
          <div key={field.id} className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </span>
            </label>
            {type === "textarea" ? (
              <textarea
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="textarea textarea-bordered w-full"
                required={field.required}
              />
            ) : (
              <input
                type={type}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="input input-bordered w-full"
                required={field.required}
              />
            )}
          </div>
        );
      })}

      {!readonly && (
        <div className="form-control mt-4">
          <button type="submit" className="btn btn-primary w-full text-white">
            Submit
          </button>
        </div>
      )}
    </form>
  );
}
