import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function HRUserForm({ user = null, onSuccess, onCancel }) {
  const { createUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value;
    const password = e.target.password?.value;
    const fullName = e.target.fullName.value;

    try {
      if (user) {
        await updateUser(user.id, { email, fullName });
        alert("User updated successfully.");
      } else {
        if (!password) throw new Error("Password is required for new users");
        await createUser({ email, password, fullName });
        alert("User created! Check email for confirmation link.");
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        name="fullName"
        placeholder="Full Name"
        defaultValue={user?.name || ""}
        className="input input-bordered"
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        defaultValue={user?.email || ""}
        className="input input-bordered"
        required
      />
      {!user && (
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="input input-bordered"
          required
        />
      )}

      <div className="flex justify-end gap-2 mt-4">
        {onCancel && (
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary text-white"
          disabled={loading}
        >
          {loading ? "Saving..." : user ? "Update HR User" : "Create HR User"}
        </button>
      </div>
    </form>
  );
}