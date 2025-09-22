import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function Placeholders({ hrId, onClose }) {
  const [placeholders, setPlaceholders] = useState([]);
  const [form, setForm] = useState({ id: null, key: "", description: "", mapping: "" });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!hrId) return;
    loadPlaceholders();
  }, [hrId]);

  async function loadPlaceholders() {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("hr_mail_placeholders")
      .select("*")
      .eq("hr_id", hrId)
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) console.error(error);
    else setPlaceholders(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hrId) return;

    const payload = {
      hr_id: hrId,
      key: form.key.trim(),
      description: form.description.trim() || null,
      mapping: form.mapping.trim(),
      template_id: null, 
    };

    setLoading(true);
    let error;
    if (form.id) {
      const { error: updateError } = await supabase
        .from("hr_mail_placeholders")
        .update(payload)
        .eq("id", form.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("hr_mail_placeholders")
        .insert([payload]);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to save placeholder: " + error.message);
    } else {
      alert(form.id ? "Placeholder updated!" : "Placeholder saved!");
      setForm({ id: null, key: "", description: "", mapping: "" });
      loadPlaceholders();
    }
  }

  function handleEdit(ph) {
    setForm({
      id: ph.id,
      key: ph.key,
      description: ph.description || "",
      mapping: ph.mapping,
    });
  }

  async function handleDelete(phId) {
    if (!confirm("Are you sure you want to delete this placeholder?")) return;
    setLoading(true);
    const { error } = await supabase.from("hr_mail_placeholders").delete().eq("id", phId);
    setLoading(false);
    if (error) {
      console.error(error);
      alert("Failed to delete placeholder");
    } else {
      alert("Placeholder deleted!");
      loadPlaceholders();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/5 flex justify-center items-start pt-20 z-50">
      <div className="bg-base-100 p-6 rounded shadow-lg w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Placeholders</h3>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Key"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              className="input input-bordered flex-1"
              required
            />
            <input
              type="text"
              placeholder="Mapping"
              value={form.mapping}
              onChange={(e) => setForm({ ...form, mapping: e.target.value })}
              className="input input-bordered flex-1"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input input-bordered w-full"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary text-white" disabled={loading}>
              {form.id ? "Update" : "Add"}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        </form>

        {loading ? (
          <p>Loading...</p>
        ) : placeholders.length === 0 ? (
          <p>No placeholders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Mapping</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {placeholders.map((ph) => (
                  <tr key={ph.id}>
                    <td>{ph.key}</td>
                    <td>{ph.mapping}</td>
                    <td>{ph.description}</td>
                    <td className="flex gap-2">
                      <button className="btn btn-sm btn-outline" onClick={() => handleEdit(ph)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-error text-white" onClick={() => handleDelete(ph.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-2">
              <button
                className="btn btn-sm"
                onClick={() => { if (page > 1) setPage(page - 1); loadPlaceholders(); }}
                disabled={page === 1}
              >
                Prev
              </button>
              <span>Page {page}</span>
              <button
                className="btn btn-sm"
                onClick={() => { setPage(page + 1); loadPlaceholders(); }}
                disabled={placeholders.length < PAGE_SIZE}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
