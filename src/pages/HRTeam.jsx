import React from "react";
import HRTeamTable from "../components/HRTeamTable";

export default function HRTeam() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">HR Team</h1>
      <p className="mb-6">Manage your HR members here.</p>
      <HRTeamTable />
    </div>
  );
}
