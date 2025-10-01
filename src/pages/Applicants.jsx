import React, { useEffect, useState, useMemo } from "react";
import supabase from "../utils/supabaseClient";
import { useAuth } from "../auth/AuthContext";
import { MdVisibility } from "react-icons/md";
import { sendApplicantStatusEmail } from "../utils/sendApplicantStatus";

export default function Applicants() {
  const { hrProfile } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const [emailSentModalOpen, setEmailSentModalOpen] = useState(false);

  useEffect(() => {
    async function fetchApplicants() {
      if (!hrProfile?.id) return;

      const { data, error } = await supabase
        .from("applicants")
        .select("*, forms!inner(title)")
        .eq("forms.hr_id", hrProfile.id)
        .order("created_at", { ascending: false });

      if (!error) setApplicants(data || []);
    }
    fetchApplicants();
  }, [hrProfile]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const matchesSearch = JSON.stringify(a.data)
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter ? a.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [applicants, search, statusFilter]);

  function getApplicantName(data) {
    if (!data) return "Unnamed Applicant";

    const firstName = data.firstName || data["first-name"];
    const lastName = data.lastName || data["last-name"];
    const fullName = data.lastName || data["full-name"];

    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    if (fullName) return fullName;

    const firstStringField = Object.values(data).find(
      (val) => typeof val === "string" && val.trim() !== ""
    );
    return firstStringField || "Unnamed Applicant";
  }

  const updateStatus = async (applicant, newStatus) => {
    try {
      const { error } = await supabase
        .from("applicants")
        .update({ status: newStatus })
        .eq("id", applicant.id);

      if (error) throw error;

      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, status: newStatus } : a
        )
      );
      setSelectedApplicant((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      );

      if (hrProfile?.id) {
        const { data: templates, error: templateError } = await supabase
          .from("hr_mail_templates")
          .select("*")
          .eq("hr_id", hrProfile.id)
          .eq("trigger", newStatus)
          .eq("trigger_active", true)
          .limit(1);

        if (templateError) {
          console.error("Template fetch error:", templateError);
        } else if (templates && templates.length > 0) {
          const template = templates[0];
          await sendApplicantStatusEmail(applicant.id, hrProfile.id, newStatus, {
            subject: template.subject,
            body: template.body,
          });
          setEmailSentModalOpen(true);
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Applicants</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search applicants"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full md:w-72"
        />
        <select
          className="select select-bordered w-full md:w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interviewed">Interviewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplicants.length === 0 ? (
          <p>No applicants found.</p>
        ) : (
          filteredApplicants.map((a) => (
            <div
              key={a.id}
              className="card bg-base-300 shadow-md border border-base-200"
            >
              <div className="card-body">
                <h2 className="card-title">{getApplicantName(a.data)}</h2>
                <p className="text-sm text-gray-500">
                  Applied on {new Date(a.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs mt-1">Form: {a.forms?.title}</p>
                <span className="badge badge-secondary rounded-xs text-white mt-2">
                  {a.status}
                </span>
                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => {
                      setSelectedApplicant(a);
                      setModalOpen(true);
                    }}
                    className="btn btn-sm btn-primary text-white"
                  >
                    <MdVisibility className="h-4 w-4 mr-1" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && selectedApplicant && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Applicant Details</h3>

            <div className="max-h-[60vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedApplicant.data).map(([key, val]) =>
                  key !== "resume" ? (
                    <div key={key} className="p-3 rounded bg-base-300">
                      <strong className="capitalize">{key}:</strong>
                      <br />
                      <span className="ml-4">{String(val)}</span>
                    </div>
                  ) : null
                )}
              </div>

              {selectedApplicant.data.resume && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Resume</h4>
                  {(() => {
                    const files = Array.isArray(selectedApplicant.data.resume)
                      ? selectedApplicant.data.resume
                      : [selectedApplicant.data.resume];

                    return files.map((file, idx) => {
                      if (!file) return null;

                      const fileUrl = typeof file === "string" ? file : file.url;
                      const fileName =
                        typeof file === "string"
                          ? decodeURIComponent(
                              file.split("/").pop() || `file-${idx}`
                            )
                          : file.name || `file-${idx}`;

                      const isPDF = fileUrl.toLowerCase().endsWith(".pdf");
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);

                      return (
                        <div key={idx} className="mb-6">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm bg-secondary text-white mb-2"
                          >
                            Open in new tab
                          </a>
                          {isPDF ? (
                            <iframe
                              src={`${fileUrl}#toolbar=0&embedded=true`}
                              title={fileName}
                              className="w-full h-[500px] rounded mb-2"
                            />
                          ) : isImage ? (
                            <img
                              src={fileUrl}
                              alt={fileName}
                              className="w-full max-h-[500px] object-contain rounded mb-2"
                            />
                          ) : (
                            <p className="text-sm mb-2">{fileName}</p>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            <div className="modal-action">
              <select
                className="select select-bordered w-full sm:w-48"
                value={selectedApplicant.status || ""}
                onChange={(e) =>
                  setSelectedApplicant((prev) =>
                    prev ? { ...prev, status: e.target.value } : prev
                  )
                }
              >
                <option value="">Select Status</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                className="btn btn-primary text-white"
                onClick={() =>
                  selectedApplicant &&
                  updateStatus(selectedApplicant, selectedApplicant.status)
                }
              >
                Save
              </button>

              <button
                className="btn"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedApplicant(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {emailSentModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Applicant Status Updated</h3>
            <p>Status has been updated. An email was sent to notify the applicant.</p>
            <div className="modal-action">
              <button
                className="btn btn-primary text-white"
                onClick={() => setEmailSentModalOpen(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
