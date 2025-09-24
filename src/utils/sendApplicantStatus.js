import supabase from "../utils/supabaseClient";

export async function sendApplicantStatusEmail(applicantId, hrId, newStatus) {
  try {
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("*") 
      .eq("id", applicantId)
      .single();

    if (applicantError || !applicant) {
      console.log("Applicant not found or missing email.");
      return;
    }

    const { data: trigger, error: triggerError } = await supabase
      .from("hr_mail_triggers")
      .select("id, template_id")
      .eq("hr_id", hrId)
      .eq("event", "applicant_"+newStatus)
      .eq("is_active", true)
      .single();

    if (triggerError || !trigger) {
      console.log(`No active trigger found for status: ${newStatus}`);
      return;
    }

    const { data: template, error: templateError } = await supabase
      .from("hr_mail_templates")
      .select("id, subject, body")
      .eq("id", trigger.template_id)
      .single();

    if (templateError || !template) {
      console.log(`No template found for trigger ${trigger.id}`);
      return;
    }

    const { data: placeholders, error: phError } = await supabase
      .from("hr_mail_placeholders")
      .select("key, mapping")
      .eq("hr_id", hrId)
      .in("template_id", [null, template.id]);

    if (phError) {
      console.log("Error fetching placeholders:", phError);
    }

    let subject = template.subject;
    let body = template.body;

    if (placeholders && placeholders.length > 0) {
      placeholders.forEach(({ key, mapping }) => {
        const value = applicant[mapping] ?? "";
        const regex = new RegExp(key, "g"); 
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });
    }

    const { error: fnError } = await supabase.functions.invoke("send-email", {
      body: {
        to: applicant.email,
        subject,
        body,
      },
    });

    if (fnError) throw fnError;

    console.log(`Email sent to ${applicant.email} for status ${newStatus}`);
  } catch (err) {
    console.error("sendApplicantStatusEmail error:", err);
  }
}
