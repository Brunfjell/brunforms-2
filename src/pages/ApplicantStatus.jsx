import React, { useState } from "react";
import supabase from "../utils/supabaseClient";

export default function ApplicantStatus() {
  const [token, setToken] = useState("");
  const [applicant, setApplicant] = useState(null);

  async function checkStatus(e) {
    e.preventDefault();
    const { data, error } = await supabase
      .from("applicants")
      .select("status, created_at, data")
      .eq("token", token)
      .single();
    if (!error) setApplicant(data);
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Check Application Status</h1>
      <form onSubmit={checkStatus} className="space-y-2">
        <input
          type="text"
          placeholder="Enter your token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-2 rounded w-full"
        >
          Check Status
        </button>
      </form>

      {applicant && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Status: <strong>{applicant.status}</strong></p>
          <p>Submitted: {new Date(applicant.created_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
