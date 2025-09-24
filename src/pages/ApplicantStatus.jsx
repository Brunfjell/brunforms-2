import React, { useState } from "react";
import supabase from "../utils/supabaseClient";

export default function ApplicantStatus() {
  const [token, setToken] = useState("");
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusSteps = [
    { key: "submitted", label: "Application Submitted" },
    { key: "reviewing", label: "Under Review" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "interviewed", label: "Interviewed" },
    { key: "hired", label: "Hired" },
    { key: "rejected", label: "Rejected" },
  ];

  async function checkStatus(e) {
    e.preventDefault();
    setLoading(true);
    setApplicant(null);

    const { data, error } = await supabase
      .from("applicants")
      .select("status, created_at, data")
      .eq("token", token)
      .single();

    if (!error) {
      setApplicant(data);
    } else {
      setApplicant({ error: "Token not found" });
    }

    setLoading(false);
  }

  const renderTimeline = (status) => {
    const currentIndex = statusSteps.findIndex((s) => s.key === status);

    return (
      <ul className="timeline timeline-vertical">
        {statusSteps.map((step, idx) => {
          const isActive = idx <= currentIndex;
          return (
            <li key={step.key}>
              <div
                className={`timeline-middle ${
                  isActive ? "bg-primary text-white" : "bg-base-300"
                } rounded-full w-6 h-6 flex items-center justify-center`}
              >
                {isActive ? "✔" : ""}
              </div>
              <div
                className={`timeline-end mb-4 ${
                  isActive ? "text-primary font-semibold" : "text-gray-500"
                }`}
              >
                {step.label}
              </div>
              {idx < statusSteps.length - 1 && (
                <hr className={isActive ? "bg-primary" : "bg-base-300"} />
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Check Application Status
      </h1>

      <form
        onSubmit={checkStatus}
        className="card bg-base-100 shadow-md p-4 space-y-3"
      >
        <input
          type="text"
          placeholder="Enter your token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="input input-bordered w-full"
        />
        <button
          type="submit"
          className={`btn btn-primary w-full text-white ${loading ? "loading" : ""}`}
        >
          {loading ? "Checking..." : "Check Status"}
        </button>
      </form>

      {applicant && !applicant.error && (
        <div className="card bg-base-200 shadow-md mt-6 p-6">
          <h2 className="text-lg font-bold mb-2">Application Progress</h2>
          <p className="mb-4 text-sm text-gray-500">
            Submitted: {new Date(applicant.created_at).toLocaleString()}
          </p>
          {renderTimeline(applicant.status)}
        </div>
      )}

      {applicant?.error && (
        <div className="alert alert-error mt-6">
          <span>{applicant.error}</span>
        </div>
      )}
    </div>
  );
}
