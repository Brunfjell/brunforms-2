import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import FormBuilder from "../components/FormBuilder";
import { PiTextAlignLeftBold, PiTextColumnsBold } from "react-icons/pi";
import { TbNumber123 } from "react-icons/tb";
import { MdDateRange, MdAccessTime, MdUpload } from "react-icons/md";
import { BsUiRadiosGrid } from "react-icons/bs";
import { useAuthStore } from "../stores/authStore";
import LoadingScreen from "../components/LoadingScreen";

function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^\w_]/g, "");
}

export default function FormEditor() {
  const { id: paramId } = useParams();
  const id = paramId === "new" ? null : paramId;
  const navigate = useNavigate();
  const hrProfile = useAuthStore((state) => state.hrProfile);
  const authLoading = useAuthStore((state) => state.loading);
  const [form, setForm] = useState({ title: "", description: "", schema: [] });
  const fieldRefs = useRef({});

  useEffect(() => {
    if (!id) return;
    const loadForm = async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setForm({
          title: data.title || "",
          description: data.description || "",
          schema: Array.isArray(data.schema) ? data.schema : [],
        });
      }
    };
    loadForm();
  }, [id]);

  const saveForm = async () => {
    if (!hrProfile?.id) {
      alert("User data not loaded yet. Please wait a moment.");
      return;
    }

    try {
      const cleanSchema = form.schema.map((f) => {
        const { id, type, label, name, required, options } = f;

        return {
          id,
          type: type.replace(/\s+/g, "_").toLowerCase(),
          label: label?.trim() || "",
          name: name?.trim() || `field_${id}`, 
          required: !!required,
          options: Array.isArray(options) ? options.filter(Boolean) : [],
        };
      });

      const payload = {
        hr_id: hrProfile.id,
        title: form.title?.trim() || "Untitled Form",
        description: form.description?.trim() || "",
        schema: cleanSchema,
        is_published: false,
      };

      let error;

      if (!id) {
        const { data, error: insertError } = await supabase
          .from("forms")
          .insert(payload)
          .select()
          .single();
        error = insertError;
      } else {
        const { error: updateError } = await supabase
          .from("forms")
          .update(payload)
          .eq("id", id);
        error = updateError;
      }

      if (error) throw error;

      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving form:", err);
      alert("Error saving form: " + (err.message || "Unknown error"));
    }
  };

  const addField = (type) => {
    const newField = {
      id: Date.now(),
      type,
      label: `New ${type} question`,
      name: slugify(`New ${type} question`),
      required: false,
      options: type === "multiple choice" ? ["Option 1"] : [],
    };
    setForm((prev) => ({ ...prev, schema: [...prev.schema, newField] }));
    setTimeout(() => {
      fieldRefs.current[newField.id]?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const updateField = (fieldId, updated) => {
    setForm((prev) => ({
      ...prev,
      schema: prev.schema.map((f) => (f.id === fieldId ? updated : f)),
    }));
  };

  const removeField = (fieldId) => {
    setForm((prev) => ({
      ...prev,
      schema: prev.schema.filter((f) => f.id !== fieldId),
    }));
  };

  if (authLoading || !hrProfile) return <LoadingScreen />;

  return (
    <div className="relative flex min-h-screen max-w-4xl mx-auto">
      <div className="fixed top-1/4 flex flex-col gap-2">
        {form.schema.map((field, index) => (
          <button
            key={field.id}
            onClick={() =>
              fieldRefs.current[field.id]?.scrollIntoView({ behavior: "smooth" })
            }
            className="btn btn-sm bg-info text-white"
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto space-y-4">

          <button
            onClick={() => navigate("/dashboard")}
            className="btn hover:btn-accent hover:text-white mb-4"
          >
            ← Back to Dashboard
          </button>

        <h1 className="text-2xl font-bold">{!id ? "Create Form" : "Edit Form"}</h1>
        <input
          type="text"
          placeholder="Form Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input input-bordered w-full"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="textarea textarea-bordered w-full"
        />
        <div className="space-y-6">
          {form.schema.map((field) => (
            <div key={field.id} ref={(el) => (fieldRefs.current[field.id] = el)}>
              <FormBuilder
                value={field}
                onChange={(updated) => {
                  if (updated.label && updated.label !== field.label) {
                    updated = { ...updated, name: slugify(updated.label) };
                  }
                  updateField(field.id, updated);
                }}
                onRemove={() => removeField(field.id)}
              />
            </div>
          ))}
        </div>
        <button onClick={saveForm} className="btn btn-primary mt-6 text-white">
          Save Form
        </button>
      </div>

      <div className="fixed top-1/4 right-[2vw] md:right-[8vw] lg:right-[18vw] flex flex-col join">
        <button
          className="btn join-item bg-primary rounded-sm tooltip tooltip-right ml-[-1px]"
          data-tip="Text"
          onClick={() => addField("text")}
        >
          <PiTextAlignLeftBold className="w-5 h-5 text-white" />
        </button>
        <button
          className="btn join-item bg-primary rounded-sm tooltip tooltip-right"
          data-tip="Long Text"
          onClick={() => addField("long_text")}
        >
          <PiTextColumnsBold className="w-5 h-5 text-white" />
        </button>
        <button
          className="btn join-item bg-primary rounded-sm tooltip tooltip-right"
          data-tip="Number"
          onClick={() => addField("number")}
        >
          <TbNumber123 className="w-5 h-5 text-white" />
        </button>
        <button
          className="btn join-item bg-primary rounded-sm tooltip tooltip-right"
          data-tip="Date"
          onClick={() => addField("calendar")}
        >
          <MdDateRange className="w-5 h-5 text-white" />
        </button>
        <button
          className="btn join-item bg-primary rounded-sm tooltip tooltip-right"
          data-tip="Time"
          onClick={() => addField("time")}
        >
          <MdAccessTime className="w-5 h-5 text-white" />
        </button>
        <button
          className="btn join-item bg-primary rounded-sm tooltip tooltip-right"
          data-tip="Multiple Choice"
          onClick={() => addField("multiple_choice")}
        >
          <BsUiRadiosGrid className="w-5 h-5 text-white" />
        </button>
        <button
          className="btn join-item bg-primary rounded-sm tooltip tooltip-right"
          data-tip="Upload"
          onClick={() => addField("file_upload")}
        >
          <MdUpload className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
