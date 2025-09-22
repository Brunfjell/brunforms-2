import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { RiLogoutBoxRLine } from "react-icons/ri";

export default function Navbar() {
  const { user, hrProfile, signOut } = useAuth();

  async function handleLogout() {
    try {
      await signOut();
    } catch (err) {
      console.error("Error signing out:", err.message);
    }
  }

  const navLinks = (
    <>
      <li>
        <Link to="/Forms">Forms</Link>
      </li>
      <li>
        <Link to="/hr-team">HR Team</Link>
      </li>
      <li>
        <Link to="/applicants">Applicants</Link>
      </li>
      <li>
        <Link to="/mail">Mail</Link>
      </li>
      <li>
        <Link to="/templates">Templates</Link>
      </li>
    </>
  );

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <button tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </button>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
          >
            {navLinks}
          </ul>
        </div>

        <Link to="/Forms" className="btn btn-ghost text-xl">
          <img src="/BrunForms-Logo.png" alt="Logo" className="w-8 h-8"/>
          BrunForms
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">{navLinks}</ul>
      </div>

      <div className="navbar-end flex items-center gap-2">
        {hrProfile && (
          <span className="hidden sm:block">
            {hrProfile.name || user?.email}
          </span>
        )}
        <ThemeToggle />
        {user && (
          <button
            onClick={handleLogout}
            className="btn bg-red-500 btn-sm tooltip tooltip-bottom"
            data-tip="Logout"
          >
            <RiLogoutBoxRLine className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
