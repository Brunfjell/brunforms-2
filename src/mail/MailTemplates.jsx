import { useEffect, useState, useRef } from "react";
import supabase from "../utils/supabaseClient";
import { useAuthStore } from "../stores/authStore";
import RichTextEditor from "./RichTextEditor";
import { MdEdit, MdDelete } from "react-icons/md";

export default function MailTemplates() {
  const { hrProfile } = useAuthStore();
  const [templates, setTemplates] = useState([]);
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    subject: "",
    body: [{ type: "paragraph", children: [{ text: "" }] }],
    trigger: "submitted",
    trigger_active: true,
  });

  async function fetchTemplates() {
    if (!hrProfile?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("hr_mail_templates")
      .select("*")
      .eq("hr_id", hrProfile.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Supabase error (templates):", error);
    else setTemplates(data);

    setLoading(false);
  }

  async function fetchForms() {
    if (!hrProfile?.id) return;
    const { data, error } = await supabase
      .from("forms")
      .select("id, title, schema")
      .eq("hr_id", hrProfile.id)
      .eq("is_published", true);

    if (error) console.error("Supabase error (forms):", error);
    else setForms(data);
  }

  useEffect(() => {
    fetchTemplates();
    fetchForms();
  }, [hrProfile]);

  function handleFormSelect(formId) {
    setSelectedForm(formId);
    const form = forms.find((f) => f.id === formId);
    if (form && Array.isArray(form.schema)) {
      setFormFields(
        form.schema.map((field) => ({ name: field.name, label: field.label }))
      );
    } else {
      setFormFields([]);
    }
  }

  function insertPlaceholder(fieldName) {
    if (!editorRef.current) return;
    editorRef.current.insertText(`{${fieldName}}`);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!hrProfile?.id) return;

    const { id, ...rest } = {
      ...formData,
      body: JSON.stringify(formData.body),
    };

    if (id) {
      const { error } = await supabase
        .from("hr_mail_templates")
        .update({ ...rest, updated_at: new Date() })
        .eq("id", id)
        .eq("hr_id", hrProfile.id);
      if (error) console.error("Update error:", error);
    } else {
      const { error } = await supabase
        .from("hr_mail_templates")
        .insert([{ hr_id: hrProfile.id, ...rest }]);
      if (error) console.error("Insert error:", error);
    }

    resetForm();
    fetchTemplates();
  }

  function resetForm() {
    setFormData({
      id: null,
      name: "",
      subject: "",
      body: [{ type: "paragraph", children: [{ text: "" }] }],
      trigger: "submitted",
      trigger_active: true,
    });
    setSelectedForm(null);
    setFormFields([]);
  }

  function handleEdit(tpl) {
    if (formData.id === tpl.id) {
      resetForm();
      return;
    }

    let body = [{ type: "paragraph", children: [{ text: "" }] }];
    try {
      body = JSON.parse(tpl.body);
    } catch (e) {
      body = [{ type: "paragraph", children: [{ text: tpl.body || "" }] }];
    }
    setFormData({
      id: tpl.id,
      name: tpl.name,
      subject: tpl.subject,
      body,
      trigger: tpl.trigger || "submitted",
      trigger_active: tpl.trigger_active ?? true,
    });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this template?")) return;
    if (!hrProfile?.id) return;

    const { error } = await supabase
      .from("hr_mail_templates")
      .delete()
      .eq("id", id)
      .eq("hr_id", hrProfile.id);

    if (error) console.error("Delete error:", error);
    fetchTemplates();
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Mail Templates</h2>

      <form onSubmit={handleSave} className="space-y-4 mb-8 relative">
        <input
          type="text"
          placeholder="Template Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 input input-bordered rounded"
          required
        />

        <select
          value={formData.trigger}
          onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
          className="w-full p-2 border border-neutral-300 rounded"
        >
          <option value="submitted">Submitted</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          type="text"
          placeholder="Subject (supports {placeholders})"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full p-2 input input-bordered rounded"
          required
        />

        <div>
          <label className="block font-medium mb-1">Select Form:</label>
          <select
            value={selectedForm || ""}
            onChange={(e) => handleFormSelect(e.target.value)}
            className="w-full p-2 border border-neutral-300 rounded"
          >
            <option value="">Select Form</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </div>

        {formFields.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formFields.map((field) => (
              <button
                type="button"
                key={field.name}
                onClick={() => insertPlaceholder(field.name)}
                className="px-2 py-1 rounded bg-primary/50 text-[#1e1e1e]"
              >
                ({field.name})
              </button>
            ))}
          </div>
        )}

        <div className="rounded">
          <RichTextEditor
            ref={editorRef}
            value={formData.body}
            onChange={(value) => setFormData({ ...formData, body: value })}
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.trigger_active}
            onChange={(e) =>
              setFormData({ ...formData, trigger_active: e.target.checked })
            }
            className="toggle w-7 h-5 text-neutral-400 checked:text-red-500 rounded-sm"
          />
          Active
        </label>

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
            {formData.id ? "Update Template" : "+ Add Template"}
          </button>
          {formData.id && (
            <button
              type="button"
              className="px-4 py-2 bg-gray-400 text-white rounded"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : templates.length === 0 ? (
        <p>No templates yet.</p>
      ) : (
        <ul className="space-y-4">
          {templates.map((tpl) => (
            <li key={tpl.id} className="p-4 border border-neutral-300 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{tpl.name}</h3>
                  <p className="text-sm text-gray-600">
                    Trigger: {tpl.trigger} {tpl.trigger_active ? "(active)" : "(inactive)"}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(tpl)}
                    className="px-3 py-1 bg-secondary text-white rounded"
                  >
                    <MdEdit className="w-4 h-5"/>
                  </button>
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    className="px-3 py-1 bg-red-400 text-white rounded"
                  >
                    <MdDelete className="w-4 h-5"/>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
