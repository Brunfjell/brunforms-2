import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import supabase from "./src/utils/supabaseClient.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.post("/send-email", async (req, res) => {
  const { hrId, to, subject, body } = req.body;

  try {
    const { data: profile, error } = await supabase
      .from("hr_mail_profiles")
      .select("*")
      .eq("hr_id", hrId)
      .single();

    if (error || !profile) {
      return res.status(400).json({ error: "No SMTP profile found for this HR" });
    }

    const transporter = nodemailer.createTransport({
      host: profile.smtp_host,
      port: profile.smtp_port,
      secure: profile.smtp_port === 465, 
      auth: {
        user: profile.smtp_user,
        pass: profile.smtp_pass,
      },
    });

    await transporter.sendMail({
      from: `"${profile.from_name || "HR"}" <${profile.from_email}>`,
      to,
      subject,
      html: body,
    });

    res.json({ success: true, message: `Email sent to ${to}` });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
