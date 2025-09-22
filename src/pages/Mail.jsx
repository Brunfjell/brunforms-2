import React from "react";
import MailProfile from "../mail/MailProfile";
import MailTemplates from "../mail/MailTemplates";

export default function Mail() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mail</h1>

      <div className="tabs tabs-boxed w-full">

        <input
          type="radio"
          name="mail_tabs"
          className="tab"
          aria-label="Templates"
          defaultChecked
        />
        <div className="tab-content bg-base-100 border-base-300 p-6 rounded-lg">
          <MailTemplates />
        </div>

        <input
          type="radio"
          name="mail_tabs"
          className="tab"
          aria-label="Profile"
        />
        <div className="tab-content bg-base-100 border-base-300 p-6 rounded-lg">
          <MailProfile />
        </div>
      </div>
    </div>
  );
}
