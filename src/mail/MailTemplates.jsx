import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import { useAuth } from "../auth/AuthContext";
import Placeholders from "./Placeholders";

export default function MailTemplates() {
  const { hrProfile } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [placeholders, setPlaceholders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, name: "", subject: "", body: "" });
  const [showPlaceholderModal, setShowPlaceholderModal] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadPlaceholders();
  }, [hrProfile]);

  async function loadTemplates() {
    if (!hrProfile?.id) return;
    const { data } = await supabase
      .from("hr_mail_templates")
      .select("*")
      .eq("hr_id", hrProfile.id)
      .order("created_at", { ascending: false });
    setTemplates(data || []);
  }

  async function loadPlaceholders() {
    if (!hrProfile?.id) return;
    const { data } = await supabase
      .from("hr_mail_placeholders")
      .select("*")
      .eq("hr_id", hrProfile.id)
      .order("created_at", { ascending: true });
    setPlaceholders(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hrProfile?.id) return;

    const payload = { name: form.name, subject: form.subject, body: form.body, hr_id: hrProfile.id };

    if (form.id) {
      await supabase.from("hr_mail_templates").update(payload).eq("id", form.id);
      alert("Template updated!");
    } else {
      await supabase.from("hr_mail_templates").insert([payload]);
      alert("Template saved!");
    }

    setForm({ id: null, name: "", subject: "", body: "" });
    setShowForm(false);
    loadTemplates();
  }

  function handleEdit(template) {
    setForm({ id: template.id, name: template.name, subject: template.subject, body: template.body });
    setShowForm(true);
  }

  function insertPlaceholder(key) {
    const textarea = document.getElementById("template-body");
    const cursorPos = textarea?.selectionStart || form.body.length;
    const newBody = form.body.slice(0, cursorPos) + `{${key}}` + form.body.slice(cursorPos);
    setForm({ ...form, body: newBody });
    textarea?.focus();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Templates</h2>
        <div className="flex gap-2">
          <button className="btn btn-primary text-white" onClick={() => setShowForm(true)}>
            + New Template
          </button>
          <button className="btn" onClick={() => setShowPlaceholderModal(true)}>
            Placeholders
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Template Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input input-bordered w-full"
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="input input-bordered w-full"
            required
          />
          <div>
            <label className="block mb-1 font-medium">Body</label>
            <textarea
              id="template-body"
              placeholder="Body (use placeholders like {applicantName}, {email})"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="textarea textarea-bordered w-full"
              rows={6}
              required
            />
            {placeholders.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Click to insert placeholders:</p>
                <div className="flex flex-wrap gap-2">
                  {placeholders.map((ph) => (
                    <button
                      type="button"
                      key={ph.id}
                      className="badge badge-outline cursor-pointer hover:bg-base-200"
                      onClick={() => insertPlaceholder(ph.key)}
                    >
                      {`{${ph.key}}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary text-white">
              {form.id ? "Update" : "Save"}
            </button>
            <button type="button" className="btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {templates.length === 0 ? (
        <p>No templates yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="card bg-base-200 shadow-md p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">{t.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{t.subject}</p>
                <p className="text-xs text-gray-500 line-clamp-3">{t.body}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn btn-sm btn-outline" onClick={() => handleEdit(t)}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPlaceholderModal && (
        <Placeholders hrId={hrProfile?.id} onClose={() => setShowPlaceholderModal(false)} />
      )}
    </div>
  );
}
