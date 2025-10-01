import supabase from "./supabaseClient";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replacePlaceholders(text, applicant) {
  if (!text) return text;

  const matches = text.match(/{{\s*[\w.-]+\s*}}|{\s*[\w.-]+\s*}/g) || [];

  let applicantData = applicant.data;
  if (typeof applicantData === "string") {
    try {
      applicantData = JSON.parse(applicantData);
    } catch {
      applicantData = {};
    }
  }

  matches.forEach((match) => {
    const key = match.replace(/[{}]/g, "").trim();

    let value = applicant[key];

    if (value === undefined && applicantData) {
      const parts = key.split(".");
      value = parts.reduce(
        (acc, part) => (acc ? acc[part] : undefined),
        applicantData
      );
    }

    if (value !== undefined && value !== null) {
      const regex = new RegExp(escapeRegex(match), "g");
      text = text.replace(regex, value);
    }
  });

  return text;
}

function cleanTemplateText(text) {
  if (!text) return "";

  text = text.replace(/^"(.*)"$/, "$1");
  text = text.replace(/\\n/g, "\n");
  text = text.replace(/\n\s*/g, "\n");
  text = text.replace(/\\"/g, '"');

  return text.trim();
}

export async function sendApplicantStatusEmail(applicantId, hrId, newStatus) {
  try {
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("*")
      .eq("id", applicantId)
      .maybeSingle();

    if (applicantError || !applicant) {
      console.error("Applicant not found or missing email:", applicantError);
      return;
    }

    if (!applicant.form_id) {
      console.log("Applicant has no form_id, skipping email.");
      return;
    }

    const { data: template, error: templateError } = await supabase
      .from("hr_mail_templates")
      .select("id, subject, body")
      .eq("hr_id", hrId)
      .eq("trigger", newStatus)
      .eq("trigger_active", true)
      .eq("form_id", applicant.form_id)
      .maybeSingle();

    if (templateError || !template) {
      console.log(
        `No active template found for trigger "${newStatus}" and form_id ${applicant.form_id}`
      );
      return;
    }

    const subject = cleanTemplateText(
      replacePlaceholders(template.subject, applicant)
    );
    const body = cleanTemplateText(
      replacePlaceholders(template.body, applicant)
    );

    const response = await fetch("http://localhost:5000/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: applicant.email || applicant.data?.email,
        subject,
        text: body,
        html: body,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to send email");
    }

    console.log(
      `Email sent to ${applicant.email || applicant.data?.email} for status "${newStatus}"`
    );
  } catch (err) {
    console.error("sendApplicantStatusEmail error:", err);
  }
}
