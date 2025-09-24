import React, { useEffect, useState, useMemo } from "react";
import supabase from "../utils/supabaseClient";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import { MdEdit, MdDelete, MdPublish } from "react-icons/md";
import { FaLink } from "react-icons/fa";

export default function HRDashboard() {
  const { hrProfile } = useAuth();
  const [forms, setForms] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);

  useEffect(() => {
    async function fetchForms() {
      if (!hrProfile?.id) return;
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("hr_id", hrProfile.id)
        .order("created_at", { ascending: false });
      if (!error) setForms(data || []);
    }
    fetchForms();
  }, [hrProfile]);

  const confirmDeleteForm = (form) => {
    setFormToDelete(form);
    setModalOpen(true);
  };

  const deleteForm = async () => {
    if (!formToDelete) return;
    try {
      const { error } = await supabase
        .from("forms")
        .delete({ returning: "minimal" })
        .eq("id", formToDelete.id);

      if (error) throw error;

      setForms((prev) => prev.filter((f) => f.id !== formToDelete.id));
      setModalOpen(false);
      setFormToDelete(null);
    } catch (err) {
      console.error("Failed to delete form:", err);
      alert("Failed to delete form");
    }
  };

  const handlePublish = async (form) => {
    try {
      const newStatus = !form.is_published;
      const { error } = await supabase
        .from("forms")
        .update({ is_published: newStatus })
        .eq("id", form.id);

      if (error) throw error;

      setForms((prev) =>
        prev.map((f) =>
          f.id === form.id ? { ...f, is_published: newStatus } : f
        )
      );

      if (newStatus) {
        const link = `${window.location.origin}/public/forms/${form.id}`;
        await navigator.clipboard.writeText(link);
        alert("Form published! Link copied to clipboard.");
      } else {
        alert("Form unpublished.");
      }
    } catch (err) {
      console.error("Failed to update publish status:", err);
      alert("Failed to update publish status.");
    }
  };

  const filteredForms = useMemo(() => {
    return forms.filter((f) => {
      const matchesTitle = f.title.toLowerCase().includes(search.toLowerCase());
      const matchesDate = filterDate
        ? f.created_at.startsWith(filterDate)
        : true;
      return matchesTitle && matchesDate;
    });
  }, [forms, search, filterDate]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Forms</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full md:w-64"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input input-bordered w-full md:w-48"
          />
        </div>
        <Link
          to="/forms/new"
          className="bg-primary text-white px-4 py-2 rounded"
        >
          + Create New Form
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.length === 0 ? (
          <p>No forms found.</p>
        ) : (
          filteredForms.map((form) => (
            <div key={form.id} className="card bg-base-300 w-full shadow-sm">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title">{form.title}</h2>
                  <button
                    onClick={() => confirmDeleteForm(form)}
                    className="btn btn-sm btn-error text-white"
                  >
                    <MdDelete className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Created: {new Date(form.created_at).toLocaleDateString()}
                </p>
                <p className="mt-2 text-gray-700">
                  {form.description || "No description provided."}
                </p>
                <div className="card-actions justify-end mt-4 gap-2">
                  <button
                    onClick={() => handlePublish(form)}
                    className={`btn btn-sm ${
                      form.is_published ? "btn-warning" : "btn-accent"
                    } text-white tooltip tooltip-bottom`}
                    data-tip={form.is_published ? "Unpublish" : "Publish"}
                  >
                    <MdPublish className="h-4 w-4" />
                  </button>
                  <a
                    onClick={async () => {
                      const link = `${window.location.origin}/public/forms/${form.id}`;
                      try {
                        await navigator.clipboard.writeText(link);
                        alert("Form link copied to clipboard!");
                      } catch (err) {
                        console.error("Failed to copy link:", err);
                        alert("Failed to copy link.");
                      }
                    }}
                    className="btn btn-sm btn-info text-white cursor-pointer tooltip tooltip-bottom"
                    data-tip="Copy Link"
                  >
                    <FaLink className="h-3 w-3" />
                  </a>
                  <Link
                    to={`/forms/${form.id}/edit`}
                    className="btn btn-sm btn-primary text-white"
                  >
                    <MdEdit className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              Delete "{formToDelete?.title}"?
            </h3>
            <p className="py-4">
              This action cannot be undone. Are you sure you want to delete this
              form?
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setModalOpen(false);
                  setFormToDelete(null);
                }}
              >
                Cancel
              </button>
              <button className="btn btn-error text-white" onClick={deleteForm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
