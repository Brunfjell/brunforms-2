import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useUIStore } from "../stores/uiStore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { signInWithPassword, signInWithMagicLink, createUser, user } = useAuth();
  const { pushToast } = useUIStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (mode === "signin") {
        await signInWithPassword({ email, password });
        pushToast({ type: "success", message: "Signed in successfully" });
        navigate("/dashboard");
      } else if (mode === "signup") {
        await createUser({ email, password, name: "New HR User" });
        pushToast({ type: "success", message: "Account created" });
        navigate("/dashboard");
      } else if (mode === "magic") {
        await signInWithMagicLink(email);
        pushToast({ type: "info", message: "Magic link sent to email" });
      }
    } catch (err) {
      pushToast({ type: "error", message: err.message });
    }
  }

  const handleChange = (event) => {
    const lowercasedValue = event.target.value.toLowerCase();
    setEmail(lowercasedValue);
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left max-w-md">
          <h1 className="text-5xl font-bold">Welcome Back</h1>
          <p className="py-6">
            Manage onboarding with ease. Create forms, track applicants, and streamline HR processes
            all in one place.
          </p>
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleSubmit}>
            <fieldset className="fieldset space-y-3">
              <label className="label">Email</label>
              <input
                type="email"
                className="input input-bordered w-full"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleChange(e);
                }}
                required
              />

              {mode !== "magic" && (
                <>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={mode !== "magic"}
                  />
                </>
              )}

              <div className="flex justify-between items-center text-sm">
                <a className="link link-hover">Forgot password?</a>
                <div className="join">
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className={`btn btn-xs join-item ${mode === "signin" ? "btn-active" : ""}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`btn btn-xs join-item ${mode === "signup" ? "btn-active" : ""}`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("magic")}
                    className={`btn btn-xs join-item ${mode === "magic" ? "btn-active" : ""}`}
                  >
                    Magic Link
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-neutral w-full mt-4">
                {mode === "signin"
                  ? "Login"
                  : mode === "signup"
                  ? "Create Account"
                  : "Send Magic Link"}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}
