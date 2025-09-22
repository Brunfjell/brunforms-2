import React, { useEffect, useState, useMemo, useCallback } from "react";
import supabase from "../utils/supabaseClient";
import { MdEdit, MdDelete } from "react-icons/md";
import HRUserForm from "../auth/CreateUserForm";

export default function HRTeamTable() {
  const [team, setTeam] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 

  const pageSize = 10;

  const fetchTeam = useCallback(async () => {
    setLoading(true);

    const { data: hrUsers, error, count } = await supabase
      .from("hr_users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error("Error fetching hr_users:", error);
      setLoading(false);
      return;
    }

    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      setLoading(false);
      return;
    }

    const teamWithAuth = hrUsers.map((u) => {
      const authUser = authUsers?.users.find((au) => au.id === u.id);
      return {
        ...u,
        email: authUser?.email || "—",
        phone: authUser?.phone || "—",
      };
    });

    setTeam(teamWithAuth);
    setTotal(count || 0);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const totalPages = Math.ceil(total / pageSize);

  const filteredTeam = useMemo(() => {
    if (!search) return team;
    const term = search.toLowerCase();
    return team.filter((u) => {
      return (
        u.id.toLowerCase().includes(term) ||
        (u.name || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.phone || "").toLowerCase().includes(term)
      );
    });
  }, [team, search]);

  async function handleDelete(userId) {
    if (!userId) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this HR member?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("hr_users").delete().eq("id", userId);

    if (error) {
      alert("Error deleting HR member: " + error.message);
    } else {
      setTeam((prev) => prev.filter((u) => u.id !== userId));
      setTotal((prev) => prev - 1);
    }
  }

  function openCreateModal() {
    setSelectedUser(null);
    setModalOpen(true);
  }

  function openEditModal(user) {
    setSelectedUser(user);
    setModalOpen(true);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search HR members..."
          className="input input-bordered w-full md:w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary text-white" onClick={openCreateModal}>
          + Add HR User
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-6">Loading...</div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeam.length > 0 ? (
                filteredTeam.map((user) => (
                  <tr key={user.id}>
                    <td className="truncate max-w-[150px]">{user.id}</td>
                    <td>{user.name || "—"}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-sm btn-primary text-white"
                        onClick={() => openEditModal(user)}
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        className="btn btn-sm btn-error text-white"
                        onClick={() => handleDelete(user.id)}
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No HR members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="join flex justify-center mt-4">
          <button
            className="join-item btn btn-sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            «
          </button>
          <button className="join-item btn btn-sm">
            Page {page} of {totalPages}
          </button>
          <button
            className="join-item btn btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            »
          </button>
        </div>
      )}

      {modalOpen && (
        <dialog open className="modal">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4">
              {selectedUser ? "Edit HR User" : "Create HR User"}
            </h3>
            <HRUserForm
              user={selectedUser}
              onSuccess={() => {
                setModalOpen(false);
                fetchTeam();
              }}
              onCancel={() => setModalOpen(false)}
            />
          </div>
        </dialog>
      )}
    </div>
  );
}
