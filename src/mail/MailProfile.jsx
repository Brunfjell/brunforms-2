import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import { useAuth } from "../auth/AuthContext";

export default function MailProfile() {
  const { hrProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_pass: "",
    from_name: "",
    from_email: "",
  });

  useEffect(() => {
    async function loadProfile() {
      if (!hrProfile?.id) return;
      const { data } = await supabase
        .from("hr_mail_profiles")
        .select("*")
        .eq("hr_id", hrProfile.id)
        .single();
      if (data) {
        setProfile(data);
        setForm(data);
      }
    }
    loadProfile();
  }, [hrProfile]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hrProfile?.id) return;

    const payload = { ...form, hr_id: hrProfile.id };

    if (profile) {
      await supabase
        .from("hr_mail_profiles")
        .update(payload)
        .eq("id", profile.id);
    } else {
      await supabase.from("hr_mail_profiles").insert([payload]);
    }
    alert("Mail profile saved!");
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Mail Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="SMTP Host"
          value={form.smtp_host}
          onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
          className="input input-bordered w-full"
          required
        />
        <input
          type="number"
          placeholder="SMTP Port"
          value={form.smtp_port}
          onChange={(e) => setForm({ ...form, smtp_port: e.target.value })}
          className="input input-bordered w-full"
        />
        <input
          type="text"
          placeholder="SMTP User"
          value={form.smtp_user}
          onChange={(e) => setForm({ ...form, smtp_user: e.target.value })}
          className="input input-bordered w-full"
          required
        />
        <input
          type="password"
          placeholder="SMTP Password / App Password"
          value={form.smtp_pass}
          onChange={(e) => setForm({ ...form, smtp_pass: e.target.value })}
          className="input input-bordered w-full"
          required
        />
        <input
          type="text"
          placeholder="From Name"
          value={form.from_name}
          onChange={(e) => setForm({ ...form, from_name: e.target.value })}
          className="input input-bordered w-full"
        />
        <input
          type="email"
          placeholder="From Email"
          value={form.from_email}
          onChange={(e) => setForm({ ...form, from_email: e.target.value })}
          className="input input-bordered w-full"
          required
        />
        <button type="submit" className="btn btn-primary text-white">
          Save Profile
        </button>
      </form>
    </div>
  );
}
